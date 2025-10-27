
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById, Product } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';
import { getPendingOrder, deletePendingOrder } from '@/lib/order-cache';

// This function handles the server-to-server POST webhook from ToyyibPay
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const billcode = formData.get('billcode') as string;
    const status = formData.get('status') as string; // '1' for success, '3' for fail
    const order_id = formData.get('order_id') as string; // This is our custom unique order ID now
    const billpaymentAmount = formData.get('billpaymentAmount') as string;
    const msg = formData.get('msg') as string;

    console.log('--- ToyyibPay Server-to-Server Webhook Received (POST) ---');
    console.log({
        billcode,
        status,
        order_id,
        billpaymentAmount,
        msg
    });

    if (status === '1') { // Payment was successful
        // 3. Retrieve the full order details using the unique ID from the webhook
        const pendingOrder = getPendingOrder(order_id);
        
        if (!pendingOrder) {
            console.error(`CRITICAL: Could not find pending order for ID: ${order_id}. This might be a duplicate webhook or an error.`);
            // Return 200 to prevent ToyyibPay from retrying a webhook for an order we can't find.
            return new Response('OK', { status: 200 }); 
        }

        const { name, email, phone, cart, totalAmountUSD } = pendingOrder;

        const orderTotalMYR = parseFloat(billpaymentAmount).toFixed(2);
        const orderTotal = `RM${orderTotalMYR}`;
        const finalOrder: Order = {
            id: billcode,
            customerName: name,
            customerEmail: email,
            items: cart.map((item: any) => ({
                product: getProductById(item.id)!,
                quantity: item.quantity
            })).filter((i: any) => i.product),
            total: orderTotal,
        };
        
        try {
            // 4. Fulfill the order
            await sendOrderConfirmationEmail(finalOrder);
            console.log(`Order confirmation sent for ToyyibPay bill ${billcode}`);

            // Secondary actions (logging/notification) only after email is confirmed sent.
            const itemsList = finalOrder.items.map((i: { product: Product; quantity: number }) => `- ${i.product.name} (x${i.quantity})`).join('\n');
            const telegramMessage = `
🛍️ *New ToyyibPay Order!* 🛍️

Alhamdulillah, a new order has come in! So much barakah! ✨ Let's celebrate! 🥳

*Order ID:* ${billcode}
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone}
*Total:* ${orderTotal}

*Items:*
${itemsList}

Let's get this packed with love and duas! 💖
            `;
            await sendTelegramNotification(telegramMessage);

            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
                const timestamp = new Date().toISOString();
                const productNames = finalOrder.items.map((i: { product: Product }) => i.product.name).join(', ');
                const values = [[timestamp, name, email, phone, productNames, totalAmountUSD.toString()]];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
            
            // 5. Clean up the pending order
            deletePendingOrder(order_id);

        } catch (fulfillmentError: any) {
            console.error(`CRITICAL: Order fulfillment failed for successful order ${billcode}.`, fulfillmentError.message);
            // Even on failure, we must return 200 to Toyyibpay to prevent retries.
            // The error is logged for manual intervention. The pending order is NOT deleted so it can be retried.
        }
    } else {
      // Log failed or other status payments for monitoring purposes.
      console.log(`Webhook: Payment for bill ${billcode} has status: ${status} (${msg}). No action taken.`);
    }

    // IMPORTANT: Always return a 200 OK response to ToyyibPay to acknowledge receipt of the webhook.
    return new Response('OK', { status: 200 });

  } catch (error: any)
    {
    console.error('ToyyibPay Webhook General Error:', error);
    // Return a 500 but ToyyibPay will likely retry. This indicates a server-side bug.
    return NextResponse.json({ error: 'An error occurred processing the callback.' }, { status: 500 });
  }
}

// This function handles the user's browser being redirected back from ToyyibPay
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const redirectUrl = new URL('/checkout/success', origin);
    
    // Pass all relevant query parameters from ToyyibPay to the success page.
    searchParams.forEach((value, key) => {
        // We only need status_id and billcode for display purposes on the client.
        if (key === 'status_id' || key === 'billcode') {
            redirectUrl.searchParams.set(key, value);
        }
    });
    
    return NextResponse.redirect(redirectUrl);
}

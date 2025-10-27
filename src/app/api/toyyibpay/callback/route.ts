
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById, Product } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

// This function handles the server-to-server POST webhook from ToyyibPay
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract all data from the webhook payload
    const billcode = formData.get('billcode') as string;
    const status = formData.get('status') as string; // '1' for success, '3' for fail
    const order_id = formData.get('order_id') as string; // This is our custom JSON payload
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
        let orderDetails;
        try {
            // The complete, untruncated custom data we sent is in the 'order_id' field of the webhook.
            orderDetails = JSON.parse(order_id);
        } catch (e) {
            console.error(`CRITICAL: Failed to parse order_id from ToyyibPay webhook for bill ${billcode}. Payload: ${order_id}`);
            // Acknowledge receipt to ToyyibPay even if we can't parse, to prevent retries.
            return new Response('OK', { status: 200 }); 
        }

        const { name, email, phone, cart, totalAmountUSD } = orderDetails;

        const orderTotalMYR = parseFloat(billpaymentAmount).toFixed(2);
        const orderTotal = `RM${orderTotalMYR}`;
        const order: Order = {
            id: billcode,
            customerName: name,
            customerEmail: email,
            items: cart.map((item: any) => ({
                product: getProductById(item.id)!,
                quantity: item.quantity
            })).filter((i: any) => i.product),
            total: orderTotal,
        };
        
        // This is now the primary place for order fulfillment.
        try {
            // Primary action: Send email confirmation. This should throw an error if it fails.
            await sendOrderConfirmationEmail(order);
            console.log(`Order confirmation sent for ToyyibPay bill ${billcode}`);

            // Secondary actions (logging/notification) only after email is confirmed sent.
            const itemsList = order.items.map((i: { product: Product; quantity: number }) => `- ${i.product.name} (x${i.quantity})`).join('\n');
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
                const productNames = order.items.map((i: { product: Product }) => i.product.name).join(', ');
                const values = [[timestamp, name, email, phone, productNames, totalAmountUSD.toString()]];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
        } catch (fulfillmentError: any) {
            console.error(`CRITICAL: Order fulfillment failed for successful order ${billcode}.`, fulfillmentError.message);
            // Even on failure, we must return 200 to Toyyibpay to prevent retries.
            // The error is logged for manual intervention.
        }
    } else {
      // Log failed or other status payments for monitoring purposes.
      console.log(`Webhook: Payment for bill ${billcode} has status: ${status} (${msg}). No action taken.`);
    }

    // IMPORTANT: Always return a 200 OK response to ToyyibPay to acknowledge receipt of the webhook.
    // Failure to do so will cause ToyyibPay to retry sending the webhook.
    return new Response('OK', { status: 200 });

  } catch (error: any) {
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
    
    // Pass all relevant query parameters from ToyyibPay (status_id, etc) to the success page.
    // The success page will use these to display the correct message to the user.
    searchParams.forEach((value, key) => {
        // We only need status_id and billcode for display purposes on the client.
        // The actual order data is handled by the POST webhook.
        if (key === 'status_id' || key === 'billcode') {
            redirectUrl.searchParams.set(key, value);
        }
    });
    
    return NextResponse.redirect(redirectUrl);
}

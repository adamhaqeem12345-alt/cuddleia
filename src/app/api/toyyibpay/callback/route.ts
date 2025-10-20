
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

/**
 * Handles the server-to-server callback (webhook) from ToyyibPay.
 * This is the most reliable way to confirm an order as it's server-to-server.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const billcode = formData.get('billcode') as string;
    const status = formData.get('status') as string; // '1' for success
    const order_id = formData.get('order_id') as string; // This is our custom JSON payload
    const billpaymentAmount = formData.get('billpaymentAmount') as string;
    
    console.log('--- ToyyibPay Server-to-Server Webhook (POST) ---');
    console.log({ billcode, status, order_id, billpaymentAmount });

    if (status === '1') {
        try {
            // The details we passed are in 'order_id' (billExternalReferenceNo)
            const orderDetails = JSON.parse(decodeURIComponent(order_id));
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
            
            // Primary action: Send email confirmation
            await sendOrderConfirmationEmail(order);
            console.log(`Order confirmation sent for ToyyibPay bill ${billcode}`);

            // Secondary actions (logging/notification)
            try {
                const itemsList = order.items.map(i => `- ${i.product.name} (x${i.quantity})`).join('\n');
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
                    const productNames = order.items.map(i => i.product.name).join(', ');
                    // Columns: Date, Customer Name, Customer Email, Phone Number, Products Purchased, Amounts (USD)
                    const values = [[timestamp, name, email, phone, productNames, totalAmountUSD.toString()]];
                    await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
                }
            } catch (secondaryError: any) {
                console.error("Secondary action (Telegram/Sheets) for ToyyibPay callback failed:", secondaryError.message);
            }
        } catch (e: any) {
            console.error(`Failed to process confirmation for bill ${billcode}:`, e.message);
        }
    } else {
      console.log(`Webhook: Payment for bill ${billcode} has status: ${status}. No action taken.`);
    }

    // Always return a 200 to ToyyibPay to acknowledge receipt.
    return new Response(null, { status: 200 });

  } catch (error: any) {
    console.error('ToyyibPay Webhook Error:', error);
    return NextResponse.json({ error: 'An error occurred processing the callback.' }, { status: 500 });
  }
}

/**
 * Handles the user redirect from the ToyyibPay payment page.
 * This is less reliable for confirmation but good for redirecting the user.
 * We no longer use this for logging, only for redirecting.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status_id = searchParams.get('status_id');
    const billcode = searchParams.get('billcode');
    const order_id = searchParams.get('order_id');

    console.log('--- ToyyibPay User Redirect (GET) ---');
    console.log({ status_id, billcode, order_id });
    
    const origin = req.nextUrl.origin;
    const redirectUrl = new URL('/checkout/success', origin);

    // Pass the parameters along to the success page for display purposes if needed
    if(status_id) redirectUrl.searchParams.set('status_id', status_id);
    if(billcode) redirectUrl.searchParams.set('billcode', billcode);
    if(order_id) redirectUrl.searchParams.set('order_id', order_id);
    
    return NextResponse.redirect(redirectUrl);
}

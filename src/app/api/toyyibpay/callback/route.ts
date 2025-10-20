
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const billcode = formData.get('billcode') as string;
    const status = formData.get('status') as string; // '1' for success
    const billExternalReferenceNo = formData.get('order_id') as string; // Correctly get the reference
    const billpaymentAmount = formData.get('billpaymentAmount') as string;
    
    console.log('--- ToyyibPay Server-to-Server Webhook (POST) ---');
    console.log({ billcode, status, billExternalReferenceNo, billpaymentAmount });

    if (status === '1') {
        let orderDetails;
        try {
            orderDetails = JSON.parse(decodeURIComponent(billExternalReferenceNo));
        } catch (e) {
            console.error(`CRITICAL: Failed to parse order_id from ToyyibPay webhook for bill ${billcode}. Payload: ${billExternalReferenceNo}`);
            return new Response(null, { status: 200 }); // Acknowledge receipt to prevent retries
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
        
        // Primary action: Send email confirmation. This should throw an error if it fails.
        await sendOrderConfirmationEmail(order);
        console.log(`Order confirmation sent for ToyyibPay bill ${billcode}`);

        // Secondary actions (logging/notification). Failure here should not fail the request.
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
                const values = [[timestamp, name, email, phone, productNames, totalAmountUSD.toString()]];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
        } catch (secondaryError: any) {
            console.error("Secondary action (Telegram/Sheets) for ToyyibPay callback failed:", secondaryError.message);
        }
    } else {
      console.log(`Webhook: Payment for bill ${billcode} has status: ${status}. No action taken.`);
    }

    return new Response(null, { status: 200 });

  } catch (error: any) {
    console.error('ToyyibPay Webhook Error:', error);
    return NextResponse.json({ error: 'An error occurred processing the callback.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const origin = req.nextUrl.origin;
    const redirectUrl = new URL('/checkout/success', origin);
    
    // Pass all query parameters from ToyyibPay to the success page
    searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(redirectUrl);
}

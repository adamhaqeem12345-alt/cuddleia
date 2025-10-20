
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

// This is a temporary in-memory store. In a serverless environment, this is not reliable.
// A more robust solution would use a database (e.g., Firestore) or cache (e.g., Redis).
const billStore: { [billCode: string]: any } = {};

// Helper to store bill details when created
export const storeBillDetails = (billCode: string, details: any) => {
    console.log(`Storing details for bill: ${billCode}`);
    billStore[billCode] = details;
};

// Helper to retrieve bill details
const getBillDetails = (billCode: string) => {
    console.log(`Retrieving details for bill: ${billCode}. Found: ${!!billStore[billCode]}`);
    return billStore[billCode];
};


/**
 * Handles the server-to-server callback (webhook) from ToyyibPay.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const billcode = formData.get('billcode') as string;
    const status = formData.get('status') as string;

    console.log('--- ToyyibPay Server-to-Server Webhook (POST) ---');
    console.log({ billcode, status });

    if (status === '1') {
      const billDetails = getBillDetails(billcode);

      if (billDetails) {
        try {
            const orderTotalMYR = (billDetails.totalAmountInSen / 100).toFixed(2);
            const orderTotal = `RM${orderTotalMYR}`;
            const order: Order = {
                id: billcode,
                customerName: billDetails.name,
                customerEmail: billDetails.email,
                items: billDetails.cart.map((item: any) => ({
                    product: getProductById(item.id)!,
                    quantity: item.quantity
                })).filter((i: any) => i.product),
                total: orderTotal,
            };
            
            await sendOrderConfirmationEmail(order);
            console.log(`Order confirmation sent for ToyyibPay bill ${billcode}`);

            const itemsList = order.items.map(i => `- ${i.product.name} (x${i.quantity})`).join('\n');
            const telegramMessage = `
🛍️ *New ToyyibPay Order!* 🛍️

Alhamdulillah, a new order has come in! So much barakah! ✨ Let's celebrate! 🥳

*Order ID:* ${billcode}
*Name:* ${billDetails.name}
*Email:* ${billDetails.email}
*Phone:* ${billDetails.phone}
*Total:* ${orderTotal}

*Items:*
${itemsList}

Let's get this packed with love and duas! 💖
            `;
            await sendTelegramNotification(telegramMessage);

            // Log to Google Sheet
            try {
              const sheetData = [
                new Date().toISOString(),
                billDetails.name,
                billDetails.email,
                billDetails.phone,
                order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
                billDetails.totalAmountUSD.toFixed(2)
              ];
              await appendToSheet('Cuddleia Sales Log', sheetData);
            } catch (sheetError: any) {
              console.error("Failed to log ToyyibPay order to sheet:", sheetError);
              await sendTelegramNotification(`
🚨 *Google Sheets Logging Failed* 🚨

A ToyyibPay order was completed, but logging it to Google Sheets failed.

*Error:* ${sheetError.message}
*Bill Code:* ${billcode}
*Customer:* ${billDetails.name} (${billDetails.email})
              `);
            }
            
            delete billStore[billcode];
            console.log(`Cleaned up stored details for bill: ${billcode}`);

        } catch (e: any) {
            console.error(`Failed to process confirmation for bill ${billcode}:`, e.message);
        }
      } else {
        console.warn(`Could not find details for ToyyibPay bill ${billcode} to send confirmation. The in-memory store might have been cleared.`);
      }
    } else {
      console.log(`Webhook: Payment for bill ${billcode} has status: ${status}.`);
    }

    return new Response(null, { status: 200 });

  } catch (error: any) {
    console.error('ToyyibPay Webhook Error:', error);
    return NextResponse.json({ error: 'An error occurred processing the callback.' }, { status: 500 });
  }
}

/**
 * Handles the user redirect from the ToyyibPay payment page.
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

    if(status_id) redirectUrl.searchParams.set('status_id', status_id);
    if(billcode) redirectUrl.searchParams.set('billcode', billcode);
    if(order_id) redirectUrl.searchParams.set('order_id', order_id);
    
    return NextResponse.redirect(redirectUrl);
}

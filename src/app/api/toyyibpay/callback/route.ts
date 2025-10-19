
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById } from '@/lib/products';

// This is a temporary in-memory store. In production, you'd use a database.
const billStore: { [billCode: string]: any } = {};

// Helper to store bill details when created
export const storeBillDetails = (billCode: string, details: any) => {
    billStore[billCode] = details;
};

// Helper to retrieve bill details
const getBillDetails = (billCode: string) => {
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
    const order_id = formData.get('order_id') as string;
    const transaction_id = formData.get('transaction_id') as string;

    console.log('--- ToyyibPay Server-to-Server Webhook (POST) ---');
    console.log({ billcode, status, order_id, transaction_id });

    if (status === '1') {
      const billDetails = getBillDetails(billcode);

      if (billDetails) {
        try {
            const order: Order = {
                id: billcode,
                customerName: billDetails.name,
                customerEmail: billDetails.email,
                items: billDetails.cart.map((item: any) => ({
                    product: getProductById(item.id)!,
                    quantity: item.quantity
                })).filter((i: any) => i.product),
                total: `RM${(billDetails.totalAmountInSen / 100).toFixed(2)}`,
            };
            
            await sendOrderConfirmationEmail(order);
            console.log(`Order confirmation sent for ToyyibPay bill ${billcode}`);
            
            // Clean up the stored details
            delete billStore[billcode];

        } catch (e) {
            console.error(`Failed to send confirmation email for bill ${billcode}:`, e);
        }
      } else {
        console.warn(`Could not find details for ToyyibPay bill ${billcode} to send email.`);
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

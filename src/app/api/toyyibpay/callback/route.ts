
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles the server-to-server callback (webhook) from ToyyibPay.
 * This is triggered when a payment status changes.
 */
export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const formData = new URLSearchParams(bodyText);
    
    // ToyyibPay sends callback data as form-urlencoded
    const billcode = formData.get('billcode');
    const status = formData.get('status'); // 'status' is used for server callback
    const order_id = formData.get('order_id');
    const msg = formData.get('msg');
    const transaction_id = formData.get('transaction_id');
    const refno = formData.get('refno');
    const amount = formData.get('amount');

    console.log('--- ToyyibPay Server-to-Server Webhook (POST) ---');
    console.log({
      billcode,
      status,
      order_id,
      msg,
      transaction_id,
      refno,
      amount
    });

    // status '1' means payment successful
    // status '2' means pending
    // status '3' means failed
    if (status === '1') {
      // SUCCESS: Payment was successful.
      // This is where you should handle order fulfillment.
      // For example:
      // 1. Verify the transaction amount against the order in your database.
      // 2. Mark the order as paid.
      // 3. Send a confirmation email with download links.
      console.log(`Webhook: Payment for bill ${billcode} was successful.`);
      
    } else {
      // FAILED/PENDING: Log the status for monitoring.
      console.log(`Webhook: Payment for bill ${billcode} has status: ${status} (${msg})`);
    }

    // ToyyibPay's server expects a 200 OK response to acknowledge receipt.
    return NextResponse.json({ message: 'Callback received' }, { status: 200 });

  } catch (error: any) {
    console.error('ToyyibPay Webhook Error:', error);
    return NextResponse.json({ error: 'An error occurred processing the callback.' }, { status: 500 });
  }
}

/**
 * Handles the user redirect from the ToyyibPay payment page.
 * This is where the user's browser is sent after payment.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status_id = searchParams.get('status_id'); // 'status_id' for browser redirect
    const billcode = searchParams.get('billcode');
    const order_id = searchParams.get('order_id');

    console.log('--- ToyyibPay User Redirect (GET) ---');
    console.log('User has been redirected from the payment page.');
    console.log({
      status_id,
      billcode,
      order_id
    });
    
    // Redirect the user to the appropriate status page on your site.
    const origin = req.nextUrl.origin;
    const redirectUrl = new URL('/checkout/success', origin);

    // Pass the parameters to the success page to display the correct status.
    if(status_id) redirectUrl.searchParams.set('status_id', status_id);
    if(billcode) redirectUrl.searchParams.set('billcode', billcode);
    if(order_id) redirectUrl.searchParams.set('order_id', order_id);
    
    return NextResponse.redirect(redirectUrl);
}

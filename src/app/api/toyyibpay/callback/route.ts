import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const billcode = formData.get('billcode');
    const status_id = formData.get('status'); // In callback, the status is usually under the key 'status'
    const order_id = formData.get('order_id');
    const msg = formData.get('msg');
    const transaction_id = formData.get('transaction_id');

    console.log('--- ToyyibPay Callback Received ---');
    console.log('Bill Code:', billcode);
    console.log('Status ID:', status_id);
    console.log('Order ID:', order_id);
    console.log('Message:', msg);
    console.log('Transaction ID:', transaction_id);
    console.log('------------------------------------');

    // status_id '1' means payment successful
    // status_id '2' means pending
    // status_id '3' means failed
    if (status_id === '1') {
      // This is where you would handle successful payment logic.
      // For example:
      // 1. Verify the transaction with ToyyibPay if necessary.
      // 2. Update your database with the order details.
      // 3. Send a confirmation email to the customer with download links.
      console.log(`Payment for bill ${billcode} was successful.`);
    } else {
      console.log(`Payment for bill ${billcode} has status: ${status_id} (${msg})`);
    }

    // Respond to ToyyibPay's server. It's good practice to send a 200 OK.
    return NextResponse.json({ message: 'Callback received' }, { status: 200 });
  } catch (error: any) {
    console.error('ToyyibPay Callback Error:', error);
    return NextResponse.json({ error: 'An error occurred processing the callback.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status_id = searchParams.get('status_id');
    const billcode = searchParams.get('billcode');
    const order_id = searchParams.get('order_id');

    console.log('--- ToyyibPay GET request on callback URL ---');
    console.log('This is likely a user redirect, not a server-to-server callback.');
    console.log('Status ID:', status_id);
    console.log('Bill Code:', billcode);
    console.log('Order ID:', order_id);
    console.log('---------------------------------------------');
    
    // Redirect to success page as this is a browser redirect
    const origin = req.nextUrl.origin;
    return NextResponse.redirect(`${origin}/checkout/success?status_id=${status_id}&billcode=${billcode}&order_id=${order_id}`);
}

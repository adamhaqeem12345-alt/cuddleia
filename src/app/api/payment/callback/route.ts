
import { NextRequest, NextResponse } from 'next/server';
import { processToyyibpayCallback } from '@/app/actions';

// This is the SERVER-TO-SERVER callback from ToyyibPay
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const refno = formData.get('refno') as string; // Our custom data: productId|customerName|customerEmail|orderId
    const status = formData.get('status') as string; // '1' for success, '3' for fail
    const billcode = formData.get('billcode') as string;
    const msg = formData.get('msg') as string; // Optional message

    console.log('ToyyibPay Server-to-Server Callback (POST) Received:', { refno, status, billcode, msg });

    if (!refno || !status || !billcode) {
        console.error('ToyyibPay POST callback missing required parameters.');
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Process the callback asynchronously. This handles saving the order and sending the email.
    processToyyibpayCallback(refno, billcode, status).catch(err => {
        console.error("Error in background processing of ToyyibPay callback:", err);
    });

    // Respond immediately to ToyyibPay with OK to acknowledge receipt.
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Error handling ToyyibPay POST callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// This is where the USER is redirected after they attempt payment on the ToyyibPay page.
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status_id = searchParams.get('status_id'); // '1' for success, '2' for pending, '3' for fail
    const billcode = searchParams.get('billcode');
    const order_id = searchParams.get('order_id'); // ToyyibPay's internal order ID

    console.log('ToyyibPay User Redirect (GET) Received:', { status_id, billcode, order_id });

    // The actual fulfillment logic is in the POST handler for the server-to-server callback.
    // This GET handler's only job is to redirect the user to the correct page on our site.
    if (status_id === '1') { // Payment was successful
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?method=toyyibpay&billcode=${billcode}`);
    } else { // Payment failed or was cancelled
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?method=toyyibpay&billcode=${billcode}`);
    }
}

    

    
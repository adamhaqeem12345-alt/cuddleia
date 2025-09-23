
import { NextRequest, NextResponse } from 'next/server';
import { processToyyibpayCallback } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const billcode = formData.get('billcode') as string;
    const status = formData.get('status') as string; // This is the payment status
    const refno = formData.get('refno') as string; // Our custom data
    const msg = formData.get('msg') as string;

    console.log('ToyyibPay Callback Received:', { billcode, status, refno, msg });

    if (!billcode || !status || !refno) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Process the callback asynchronously
    // The status from the callback body seems to be different from the status in the redirect URL
    // so we will pass both to the handler. '1' means success.
    processToyyibpayCallback(billcode, status, refno, status).catch(err => {
        console.error("Error in processing callback:", err);
    });

    // Respond immediately to ToyyibPay
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Error handling ToyyibPay callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Toyyibpay also does a GET request to this route, so we need to handle it.
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status_id = searchParams.get('status_id');
    const billcode = searchParams.get('billcode');
    const order_id = searchParams.get('order_id');

    console.log('ToyyibPay GET Redirect Received:', { status_id, billcode, order_id });

    // This is the user returning to our site. We can show a success or failure page.
    // The actual fulfillment logic is in the POST handler for the server-to-server callback.
    if (status_id === '1') {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?method=toyyibpay`);
    } else {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?method=toyyibpay`);
    }
}

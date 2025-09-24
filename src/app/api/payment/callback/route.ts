
import { NextRequest, NextResponse } from 'next/server';
import { processToyyibpayCallback } from '@/app/actions';

// This is the SERVER-TO-SERVER callback from ToyyibPay
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const refno = formData.get('refno') as string; // Our custom data: orderId|productId|customerName|customerEmail
    const status = formData.get('status') as string; // '1' for success, '3' for fail
    const billcode = formData.get('billcode') as string;
    const msg = formData.get('msg') as string; // Optional message

    console.log('[ToyyibPay Callback] Received POST data:', { refno, status, billcode, msg });

    if (!refno || !status || !billcode) {
        console.error('[ToyyibPay Callback] Missing required parameters.', { refno, status, billcode });
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Process the callback asynchronously. This handles saving the order and sending the email.
    // We don't await this so we can respond to ToyyibPay immediately.
    processToyyibpayCallback(refno, billcode, status).catch(err => {
        console.error("[ToyyibPay Callback] Error during background processing:", err);
    });

    // Respond immediately to ToyyibPay with OK to acknowledge receipt.
    // This is crucial for ToyyibPay's system.
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('[ToyyibPay Callback] Error handling POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// This is where the USER is redirected after they attempt payment on the ToyyibPay page.
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status_id = searchParams.get('status_id'); // '1' for success, '2' for pending, '3' for fail
    const billcode = searchParams.get('billcode');
    const order_id = searchParams.get('order_id'); // ToyyibPay's internal order ID

    console.log('[ToyyibPay Redirect] User landed on GET redirect:', { status_id, billcode, order_id });
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        console.error("CRITICAL: NEXT_PUBLIC_APP_URL is not set.");
        return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // The actual fulfillment logic is in the POST handler for the server-to-server callback.
    // This GET handler's only job is to redirect the user to the correct page on our site.
    if (status_id === '1') { // Payment was successful
        return NextResponse.redirect(`${appUrl}/payment/success?method=toyyibpay&billcode=${billcode}`);
    } else { // Payment failed or was cancelled
        return NextResponse.redirect(`${appUrl}/payment/failed?method=toyyibpay&billcode=${billcode}`);
    }
}
    
    

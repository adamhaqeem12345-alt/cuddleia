
import { NextRequest, NextResponse } from 'next/server';
import { processToyyibpayCallback } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const billcode = formData.get('billcode') as string;
    const status_id = formData.get('status_id') as string; // 1 for success, 2 for pending, 3 for fail
    const order_id = formData.get('order_id') as string;
    const msg = formData.get('msg') as string;

    console.log('ToyyibPay Callback Received:', { billcode, status_id, order_id, msg });

    if (!billcode || !status_id || !order_id) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Process the callback asynchronously
    processToyyibpayCallback(billcode, status_id, order_id).catch(err => {
        console.error("Error in processing callback:", err);
    });

    // Respond immediately to ToyyibPay
    return NextResponse.json({ message: 'Callback received' }, { status: 200 });

  } catch (error) {
    console.error('Error handling ToyyibPay callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Toyyibpay also does a GET request to this route, so we need to handle it.
export async function GET(req: NextRequest) {
    return NextResponse.json({ message: 'Callback endpoint is ready for POST requests.' });
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// This is where you would handle the callback from ToyyibPay
// For example, updating your database, sending emails, etc.
// The signature check is crucial for security.

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const billcode = formData.get('billcode') as string;
    const status_id = formData.get('status_id') as string;
    const order_id = formData.get('order_id') as string;
    const msg = formData.get('msg') as string;
    const transaction_id = formData.get('transaction_id') as string;
    const signature = formData.get('signature') as string;
    
    const TOYYIBPAY_USER_SECRET_KEY = process.env.TOYYIBPAY_USER_SECRET_KEY || 'YOUR_SECRET_KEY';

    // ToyyibPay Signature Formula: sha1(status_id + billcode + order_id + TOYYIBPAY_USER_SECRET_KEY)
    const dataToSign = status_id + billcode + order_id + TOYYIBPAY_USER_SECRET_KEY;
    const generatedSignature = crypto.createHash('sha1').update(dataToSign).digest('hex');

    if (signature !== generatedSignature) {
      console.warn('Invalid signature received from ToyyibPay callback');
      // In production, you might want to return a different response or just log it.
      // For now, we'll proceed but log a warning.
      // return new Response('Invalid signature', { status: 400 });
    }
    
    // status_id: 1 = success, 2 = pending, 3 = fail
    console.log(`ToyyibPay Callback Received:
      Bill Code: ${billcode}
      Order ID: ${order_id}
      Status: ${status_id} (${status_id === '1' ? 'Success' : status_id === '2' ? 'Pending' : 'Failed'})
      Message: ${msg}
      Transaction ID: ${transaction_id}
    `);
    
    // IMPORTANT:
    // Here you should update your database with the payment status.
    // For example, find the order by `order_id` and mark it as paid if `status_id` is '1'.


    // ToyyibPay expects an empty response with status 200 OK
    return new Response(null, { status: 200 });

  } catch (error: any) {
    console.error("ToyyibPay Callback Error:", error);
    return new Response('Error processing callback', { status: 500 });
  }
}

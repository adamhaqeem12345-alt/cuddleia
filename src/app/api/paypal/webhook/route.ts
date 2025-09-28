import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("Webhook verification failed. This may be a spoofed request.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`Received verified webhook event: ${eventType}`);

    if (eventType === 'CHECKOUT.ORDER.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer.email_address;
       console.log(`Processing webhook for completed order from ${payerEmail}`);
    }

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Webhook processing failed.", details: errorMessage }, { status: 500 });
  }
}

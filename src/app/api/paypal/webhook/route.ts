import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';

export async function POST(req: Request) {
  try {
    // We need the raw body for verification, but Next.js App Router currently parses it automatically.
    // Cloning the request allows us to re-read the body. This is a common workaround.
    const body = await req.json();
    const headers = req.headers;
    
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("Webhook verification failed. This may be a spoofed request.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
    }

    // Process the webhook event
    const eventType = body.event_type;
    console.log(`Received verified webhook event: ${eventType}`);

    // Example: Handle a completed payment (can be used for redundant fulfillment)
    if (eventType === 'CHECKOUT.ORDER.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer.email_address;
       
       console.log(`Processing webhook for completed order from ${payerEmail}`);
       // You could add logic here to provision access, update your database, etc.
       // This is a good place for tasks that are not time-sensitive or as a backup
       // in case the email sending in capture-order fails.
    }
    
    // Add handlers for other events as needed (e.g., disputes, refunds)
    // if (eventType === 'PAYMENT.SALE.REFUNDED') { ... }

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Webhook processing failed.", details: errorMessage }, { status: 500 });
  }
}

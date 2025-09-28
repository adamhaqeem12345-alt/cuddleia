import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';
import { sendEmail } from '@/lib/mail';
import { products } from '@/lib/products';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("Webhook verification failed.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
    }

    // Process the webhook event
    const eventType = body.event_type;
    console.log(`Received verified webhook event: ${eventType}`);

    // Example: Handle a completed payment
    if (eventType === 'CHECKOUT.ORDER.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer.email_address;
       const payerName = orderData.payer.name.given_name;
       
       console.log(`Processing order completion for ${payerEmail}`);
       
       // You could add logic here to provision access, update your database, etc.
       // For example, re-sending the email in case the initial one failed.
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

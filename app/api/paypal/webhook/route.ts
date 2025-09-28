
import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';
import { fulfillOrder } from '@/lib/fulfillment';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    
    console.log("WEBHOOK: Received PayPal webhook. Verifying...");
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("WEBHOOK: Verification failed. This may be a spoofed request.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`WEBHOOK: Received and verified event: ${eventType}`);

    // This webhook now acts as a failsafe for order fulfillment.
    if (eventType === 'CHECKOUT.ORDER.COMPLETED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer?.email_address || '[email not available]';
       console.log(`WEBHOOK: Processing 'CHECKOUT.ORDER.COMPLETED' for order ${orderData.id} from ${payerEmail}.`);
       
       // Call the centralized fulfillment function.
       // This ensures that even if the primary capture flow fails to send an email,
       // this webhook will attempt to do so.
       await fulfillOrder(orderData);
    } else {
        console.log(`WEBHOOK: Ignoring event type '${eventType}' as no action is defined for it.`);
    }

    // Acknowledge receipt of the webhook to PayPal.
    return NextResponse.json({ status: "success" });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("WEBHOOK ERROR: Error processing PayPal webhook:", errorMessage);
    // It's crucial to still return a 200 OK to PayPal to prevent retries,
    // even if our internal processing fails. We log the error for manual follow-up.
    return NextResponse.json({ status: "error", details: errorMessage });
  }
}

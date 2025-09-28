
import { NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/paypal-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    
    console.log("Received PayPal webhook. Verifying...");
    const isVerified = await verifyWebhook(headers, body);

    if (!isVerified) {
      console.warn("Webhook verification failed. This may be a spoofed request.");
      return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`Received and verified webhook event: ${eventType}`);
    console.log("Webhook body:", JSON.stringify(body, null, 2));

    if (eventType === 'CHECKOUT.ORDER.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
       const orderData = body.resource;
       const payerEmail = orderData.payer.email_address;
       const payerName = orderData.payer.name.given_name;
       console.log(`Processing webhook for completed order ${orderData.id} from ${payerName} <${payerEmail}>.`);
       // TODO: Fulfill the order (e.g., send digital goods via email, update database).
       // Example: await sendEmailWithDownloadLinks(orderData);
    }

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Webhook processing failed.", details: errorMessage }, { status: 500 });
  }
}

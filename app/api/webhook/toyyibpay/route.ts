
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';
import { z } from 'zod';

// This schema defines the expected product structure that would have been saved with an order.
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  downloadUrl: z.string().url(),
});

// This schema validates the incoming webhook data from ToyyibPay.
const toyyibpayWebhookSchema = z.object({
    status: z.string(),
    order_id: z.string(), // Our billExternalReferenceNo
    billcode: z.string(),
    billTo: z.string(), // Customer's Name
    billEmail: z.string().email(), // Customer's Email
    billDescription: z.string(), // Contains the encoded product IDs
});

// This function now decodes the purchased item IDs from the bill description.
// This is the workaround for not having a database.
async function getPurchasedItems(billDescription: string): Promise<Product[]> {
    console.log(`[Webhook] Extracting product IDs from description: "${billDescription}"`);
    
    // Expected format: "Items: 001,002,003"
    const prefix = "Items: ";
    if (!billDescription.startsWith(prefix)) {
        console.error(`[Webhook] CRITICAL: billDescription does not have the expected "Items: " prefix.`);
        return [];
    }

    const idsString = billDescription.substring(prefix.length);
    const purchasedIds = idsString.split(',');

    if (purchasedIds.length === 0 || (purchasedIds.length === 1 && !purchasedIds[0])) {
         console.warn(`[Webhook] No product IDs found in description string: "${idsString}"`);
         return [];
    }
    
    // Find the full product details from our main products list
    const purchasedItems = products.filter(p => purchasedIds.includes(p.id));

    console.log(`[Webhook] Found ${purchasedItems.length} purchased items for order.`);
    return purchasedItems;
}


export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    const webhookData = {
        status: data.get('status'),
        order_id: data.get('order_id'), // This is our billExternalReferenceNo
        billcode: data.get('billcode'),
        billTo: data.get('billTo'),
        billEmail: data.get('billEmail'),
        billDescription: data.get('billDescription'), // This now contains our product IDs
    };
    
    const validation = toyyibpayWebhookSchema.safeParse(webhookData);

    if (!validation.success) {
        console.error('[ToyyibPay Webhook] Invalid webhook data:', validation.error.flatten().fieldErrors);
        return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const { status, order_id, billcode, billTo, billEmail, billDescription } = validation.data;

    console.log(`[ToyyibPay Webhook] Received callback for billcode: ${billcode}, status: ${status}, order_id: ${order_id}`);

    // status '1' means the payment was successful
    if (status === '1' && order_id) {
        console.log(`[Webhook] Payment successful for order ${order_id}. Customer: ${billTo} <${billEmail}>. Preparing to send email.`);

        // Get the purchased items using our new decoding function.
        const purchasedItems = await getPurchasedItems(billDescription);

        if (purchasedItems.length > 0) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            
            console.log(`[Webhook] Sending email with ${purchasedItems.length} items to ${billEmail}.`);
            
            const emailResponse = await fetch(`${appUrl}/api/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: billEmail,
                    subject: 'Your Cuddleia Order Confirmation',
                    name: billTo,
                    items: purchasedItems,
                }),
            });
            
            if (emailResponse.ok) {
                console.log(`[Webhook] Email request sent successfully for order ${order_id} to ${billEmail}.`);
            } else {
                const errorBody = await emailResponse.text();
                console.error(`[Webhook] Failed to send email for order ${order_id}. Status: ${emailResponse.status}. Body: ${errorBody}`);
            }

        } else {
             console.warn(`[Webhook] Did not send email for order ${order_id} because no purchased items could be determined from the bill description.`);
        }

    } else {
      console.log(`[Webhook] Payment status for billcode ${billcode} was not successful (status: ${status}) or order_id was missing.`);
    }

    // Always return a 200 OK to ToyyibPay to acknowledge receipt of the webhook.
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('[ToyyibPay Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

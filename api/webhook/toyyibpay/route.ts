
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
    billDescription: z.string(), // Contains the email as a backup
});

// This function simulates looking up which products were in the customer's cart.
// In a real application with a database, you would save the cart items with the order_id
// and retrieve them here. For now, we will parse them from the billDescription.
// THIS IS A WORKAROUND. A database is the proper solution.
async function getPurchasedItems(billDescription: string): Promise<Product[]> {
    console.log(`[Webhook] Simulating product lookup from description: "${billDescription}"`);
    
    // A more robust temporary solution could involve encoding item IDs in the description,
    // but for now, we have to assume we can't determine the exact items without a DB.
    // This is a major limitation. To send a generic email, we could return an empty array,
    // but the email body expects items.
    
    // Let's assume for now we cannot determine the items and must rely on manual fulfillment
    // if we don't have a DB. The code below will try to send an email, but it will be empty.
    // The correct solution is a database.
    console.warn(`[Webhook] CRITICAL: No database connected. Cannot determine which products were purchased for order. Email will not contain download links.`);
    
    // This will result in an email with no products.
    return [];
}


// A temporary function to simulate finding all products in an order.
// This is NOT robust. In a real app, you save the cart items against the orderId.
async function getOrderDetailsFromDatabase(orderId: string): Promise<{ purchasedItems: Product[] } | null> {
    console.log(`[Webhook] Simulating database lookup for orderId: ${orderId}`);
    
    // Since we don't have a database, we can't know which products were purchased.
    // We'll return a placeholder. In a real app, this would be a DB query.
    // const order = await db.collection('orders').findOne({ orderId });
    // const purchasedProducts = products.filter(p => order.itemIds.includes(p.id));
    // return { purchasedItems: purchasedProducts };

    // Let's pretend all products were purchased for the sake of sending an email.
    // This is incorrect but allows the email to be sent.
    const allProductIds = products.map(p => p.id);
    const orderInDb = { itemIds: allProductIds }; // DUMMY DATA

    const purchasedItems = products.filter(p => orderInDb.itemIds.includes(p.id));
    return { purchasedItems };
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
        billDescription: data.get('billDescription'),
    };
    
    const validation = toyyibpayWebhookSchema.safeParse(webhookData);

    if (!validation.success) {
        console.error('[ToyyibPay Webhook] Invalid webhook data:', validation.error.flatten().fieldErrors);
        return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const { status, order_id, billcode, billTo, billEmail } = validation.data;

    console.log(`[ToyyibPay Webhook] Received callback for billcode: ${billcode}, status: ${status}, order_id: ${order_id}`);

    // status '1' means the payment was successful
    if (status === '1' && order_id) {
        console.log(`[Webhook] Payment successful for order ${order_id}. Customer: ${billTo} <${billEmail}>. Sending email.`);

        // In a real app with a DB, we'd use the order_id to get the list of purchased items.
        // Since we don't have a DB, we will send an email with ALL product links as a fallback.
        // This is not ideal, but it automates the email sending.
        const orderDetails = await getOrderDetailsFromDatabase(order_id);

        if (orderDetails) {
            const { purchasedItems } = orderDetails;
            
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            
            const emailResponse = await fetch(`${appUrl}/api/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: billEmail,
                    subject: 'Your Cuddleia Order Confirmation',
                    name: billTo,
                    items: purchasedItems, // This will contain all products as a fallback
                }),
            });
            
            if (emailResponse.ok) {
                console.log(`[Webhook] Email request sent successfully for order ${order_id} to ${billEmail}.`);
            } else {
                console.error(`[Webhook] Failed to send email for order ${order_id}. Status: ${emailResponse.status}`);
            }

        } else {
             console.log(`[Webhook] Did not send email for order ${order_id} because customer details could not be retrieved.`);
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

    
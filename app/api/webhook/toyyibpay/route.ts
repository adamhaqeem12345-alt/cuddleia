
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products'; // Assuming products are accessible

// ===================================================================================
// IMPORTANT: DATABASE REQUIRED FOR THIS TO WORK
// ===================================================================================
// This function is a placeholder. In a real-world scenario, you MUST have a
// database to store customer details against the `orderId` when the bill is created.
// ToyyibPay's webhook does NOT send back the customer's name or email. It only
// sends the `order_id` (as billExternalReferenceNo).
//
// To make this work, you would:
// 1. Before creating the ToyyibPay bill (in `/checkout`), save the customer's
//    name, email, and the products in their cart to a database record
//    with the `orderId` (e.g., from `uuidv4()`).
// 2. Here in the webhook, use the `orderId` received from ToyyibPay to look up
//    that database record.
// 3. Retrieve the customer's email and purchased items from the record and
//    then call the email sending API.
// ===================================================================================
async function getOrderDetailsFromDatabase(orderId: string): Promise<{ customerEmail: string; customerName: string; purchasedItems: Product[] } | null> {
    console.log(`[Webhook] Simulating database lookup for orderId: ${orderId}`);
    
    // In a real app, you would perform a database lookup like this:
    // const order = await db.collection('orders').findOne({ orderId: orderId });
    // if (!order) return null;
    // const itemIds = order.items.map(item => item.id);
    // const purchasedProducts = products.filter(p => itemIds.includes(p.id));
    // return { customerEmail: order.customerEmail, customerName: order.customerName, purchasedItems: purchasedProducts };

    // For now, since we have no database, we return null.
    console.error(`[Webhook] CRITICAL: No database is connected. Cannot retrieve customer details for orderId ${orderId} to send email.`);
    return null;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const status = data.get('status') as string;
    const order_id = data.get('order_id') as string; // This is the billExternalReferenceNo
    const billcode = data.get('billcode') as string;

    console.log(`[ToyyibPay Webhook] Received callback for billcode: ${billcode}, status: ${status}, order_id: ${order_id}`);

    // status '1' means the payment was successful
    if (status === '1' && order_id) {
        console.log(`[Webhook] Payment successful for order ${order_id}. Attempting to fetch order details to send email.`);

        const orderDetails = await getOrderDetailsFromDatabase(order_id);

        if (orderDetails) {
            const { customerEmail, customerName, purchasedItems } = orderDetails;
            
            // This will only run if getOrderDetailsFromDatabase is implemented to return actual data from a database.
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await fetch(`${appUrl}/api/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: customerEmail,
                    subject: 'Your Cuddleia Order Confirmation',
                    name: customerName,
                    items: purchasedItems,
                }),
            });
             console.log(`[Webhook] Email request sent for order ${order_id} to ${customerEmail}.`);
        } else {
             console.log(`[Webhook] Did not send email for order ${order_id} because customer details could not be retrieved from a database.`);
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

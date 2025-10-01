
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products'; // Assuming products are accessible

// ===================================================================================
// CRITICAL: DATABASE REQUIRED FOR AUTOMATED EMAILS
// ===================================================================================
// This function simulates what's needed to send a confirmation email after a 
// successful ToyyibPay purchase.
//
// **THE PROBLEM:** ToyyibPay's webhook does NOT send back the customer's name or email. 
// It only sends the `order_id` (which we send as `billExternalReferenceNo`).
//
// **THE SOLUTION:** To automatically email the customer their download links, you
// must have a database. The workflow would be:
//
// 1. **Before Redirecting to ToyyibPay (on the Checkout Page):**
//    - Collect the customer's name and email from the new form.
//    - Generate a unique `orderId` (which you're already doing with uuidv4).
//    - Save the `orderId`, customer name, email, and the products in their cart
//      to a database record (e.g., in a collection named 'orders').
//
// 2. **In this Webhook:**
//    - Receive the `order_id` from ToyyibPay's callback.
//    - Use this `order_id` to look up the customer's details from your database.
//    - With the retrieved email and product list, call the `/api/email` route
//      to send the confirmation email.
// ===================================================================================
async function getOrderDetailsFromDatabase(orderId: string): Promise<{ customerEmail: string; customerName: string; purchasedItems: Product[] } | null> {
    console.log(`[Webhook] Simulating database lookup for orderId: ${orderId}`);
    
    // In a real app, you would perform a database lookup like this:
    // const order = await db.collection('orders').findOne({ orderId: orderId });
    // if (!order) return null;
    // const itemIds = order.items.map(item => item.id);
    // const purchasedProducts = products.filter(p => itemIds.includes(p.id));
    // return { customerEmail: order.customerEmail, customerName: order.customerName, purchasedItems: purchasedProducts };

    // For now, since we have no database, we return null. This prevents automated emails for ToyyibPay.
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

    
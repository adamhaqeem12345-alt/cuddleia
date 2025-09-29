
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products'; // Assuming products are accessible

// This function is a placeholder. In a real-world scenario, you would need
// a database to store customer details against an orderId when the bill is created.
// Then you'd look up that orderId here to get the customer's info.
async function getOrderDetailsFromDatabase(orderId: string): Promise<{ customerEmail: string; customerName: string; purchasedItems: Product[] } | null> {
    console.log(`[Webhook] Simulating database lookup for orderId: ${orderId}`);
    
    // In a real app, you would do something like:
    // const order = await db.collection('orders').findOne({ orderId: orderId });
    // if (!order) return null;
    // const itemIds = order.items.map(item => item.id);
    // const purchasedProducts = products.filter(p => itemIds.includes(p.id));
    // return { customerEmail: order.customerEmail, customerName: order.customerName, purchasedItems: purchasedProducts };

    // For now, as we don't have a database, we cannot reliably get customer data.
    // Returning null to signify that we can't proceed with the email.
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
        console.log(`[Webhook] Payment successful for order ${order_id}. Attempting to send confirmation email.`);

        // In a real application, you'd fetch order details from your database.
        const orderDetails = await getOrderDetailsFromDatabase(order_id);

        if (orderDetails) {
            const { customerEmail, customerName, purchasedItems } = orderDetails;
            
            // Call your email API to send the confirmation.
            // This will only run if getOrderDetailsFromDatabase is implemented to return actual data.
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
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

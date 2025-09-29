
import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder for a function that would fetch order details
// based on the order_id provided by the webhook. In a real application,
// you would look up the order in your database to get the customer's email
// and the list of items they purchased.
async function getOrderDetails(orderId: string) {
    // In a real app, you'd do:
    // const order = await database.orders.find({ where: { id: orderId }});
    // return { customerEmail: order.customerEmail, items: order.items };
    
    // For this example, we'll return placeholder data.
    // IMPORTANT: The email sending will fail unless you can retrieve the
    // actual customer email and purchased items associated with the order_id.
    console.warn(`[ToyyibPay Webhook] Using placeholder data for orderId: ${orderId}. You must implement a database lookup.`);
    return {
        customerEmail: 'customer-from-db@example.com', // This should be retrieved from your database
        customerName: 'Valued Customer', // This should be retrieved from your database
        purchasedItems: [], // This should be a list of Product objects from your database
    };
}


export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const status = data.get('status');
    const order_id = data.get('order_id') as string; // This is the billExternalReferenceNo we sent
    const billcode = data.get('billcode');

    console.log(`[ToyyibPay Webhook] Received callback for billcode: ${billcode}, status: ${status}`);

    // status '1' means the payment was successful
    if (status === '1' && order_id) {
        
      // In a real-world scenario, you would look up the order in your database
      // using the order_id (billExternalReferenceNo) to get the customer's email
      // and the specific items they purchased.
      const { customerEmail, customerName, purchasedItems } = await getOrderDetails(order_id);

      // We don't have the customer's email directly in the webhook payload from Toyyibpay.
      // A database that stores cart contents against the `billExternalReferenceNo` is required for a complete solution.
      // Since we don't have that, we can't reliably send an email from here.
      // We will log the success and you would need to implement the database logic.
      
      console.log(`[ToyyibPay Webhook] Payment successful for order ${order_id}.`);
      console.log(`[ToyyibPay Webhook] An email should be sent to ${customerEmail}.`);

      // Here you would call your email API.
      // NOTE: This call will likely fail without a real database lookup implemented in getOrderDetails.
      /*
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
      */

    } else {
      console.log(`[ToyyibPay Webhook] Payment status for billcode ${billcode} was not successful (status: ${status}) or order_id was missing.`);
    }

    // Always return a 200 OK to ToyyibPay to acknowledge receipt of the webhook.
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('[ToyyibPay Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

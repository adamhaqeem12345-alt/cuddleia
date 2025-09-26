
import { NextResponse } from 'next/server';
import { captureOrder as capturePaypalOrder } from '@/lib/paypal-api';

// STUB FUNCTION: This is a placeholder. In a real application, you would
// write the captured order data to your database (e.g., Firestore).
async function saveOrderAfterCapture(orderID: string, captureData: any) {
  console.log(`[STUB] Saving captured order ${orderID} to database.`);
  // Example database call:
  // await db.collection('orders').doc(orderID).update({ status: 'PAID', captureData });
  return Promise.resolve();
}


export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/capture-order");
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const capturedData = await capturePaypalOrder(orderID);
    
    // Optional: save the successful capture to your database.
    // This is useful for your own records but email is sent via webhook.
    await saveOrderAfterCapture(orderID, capturedData);
    
    return NextResponse.json(capturedData);

  } catch (error: any) {
    console.error("API /capture-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 });
  }
}

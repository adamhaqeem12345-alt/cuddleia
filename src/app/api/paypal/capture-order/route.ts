import { NextResponse } from 'next/server';
import { captureOrder as capturePaypalOrder } from '@/lib/paypal-api';

// Stub function to prevent build errors.
// In a real application, this would update your database.
async function saveOrderAfterCapture(orderID: string, captureData: any) {
  console.log(`[Stub] saveOrderAfterCapture called for Order ID: ${orderID}`);
  // In a real implementation, you would write to Firestore or another database here.
  // For example: await db.collection('orders').doc(orderID).update({ status: 'PAID', captureData });
  return;
}


export async function POST(request: Request) {
  console.log("Received request for /api/paypal/capture-order");
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const capturedData = await capturePaypalOrder(orderID);
    console.log("Successfully captured PayPal order:", orderID);
    
    // Optional: save the successful capture to your database.
    await saveOrderAfterCapture(orderID, capturedData);
    
    return NextResponse.json(capturedData);

  } catch (error: any) {
    console.error("API /capture-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 });
  }
}

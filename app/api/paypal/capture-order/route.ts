import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

// This is a self-contained stub function to prevent build errors.
// In a real application, you would replace this with your database logic.
async function saveOrderAfterCapture(orderID: string, captureData: any) {
  console.log(`[STUB] Saving captured order ${orderID} to database.`);
  // Example: await db.collection('orders').doc(orderID).update({ status: 'COMPLETED', captureInfo: captureData });
  return Promise.resolve();
}


export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/capture-order");
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const capturedData = await captureOrder(orderID);
    
    // Stubbed call to a database save function.
    await saveOrderAfterCapture(orderID, capturedData);
    
    return NextResponse.json(capturedData);

  } catch (error: any) {
    console.error("API /capture-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 });
  }
}

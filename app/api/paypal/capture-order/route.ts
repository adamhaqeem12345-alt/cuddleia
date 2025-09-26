
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

  // Environment Variable Check
  if (!process.env.PAYPAL_API_URL || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("Configuration error: PayPal environment variables are not fully set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

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
    // Return a more generic error to the client, but log the detailed one.
    return NextResponse.json({ error: "Failed to capture order" }, { status: 500 });
  }
}

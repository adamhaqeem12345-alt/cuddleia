import { NextResponse } from 'next/server';
import { captureOrder as capturePaypalOrder } from '@/lib/paypal-api';

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const capturedData = await capturePaypalOrder(orderID);
    return NextResponse.json(capturedData);

  } catch (error: any) {
    console.error("API /capture-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const { json, httpStatusCode } = await captureOrder(orderID);

    return NextResponse.json(json, { status: httpStatusCode });
  } catch (error: any) {
    console.error("Failed to capture order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

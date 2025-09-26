import { NextResponse } from 'next/server';
import { createOrder as createPaypalOrder } from '@/lib/paypal-api';

export async function POST(request: Request) {
  try {
    const { total } = await request.json();
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }
    
    const orderId = await createPaypalOrder(total);
    return NextResponse.json({ id: orderId });

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

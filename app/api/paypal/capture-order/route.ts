
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
        return NextResponse.json({ error: 'PayPal Order ID is missing.' }, { status: 400 });
    }

    const data = await captureOrder(orderId);
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error capture-order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

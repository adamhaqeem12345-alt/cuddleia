import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';

export async function POST(request: Request) {
  try {
    const { cart } = await request.json();
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart data is missing.' }, { status: 400 });
    }

    // The 'cart' received here only contains id and quantity.
    // The server will look up the price and name from a secure source.
    const { id, approveUrl } = await createOrder(cart);
    return NextResponse.json({ id, approveUrl });

  } catch (error) {
    console.error('API Error create-order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

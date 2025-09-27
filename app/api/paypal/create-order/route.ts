import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { cart }: { cart: CartItem[] } = await request.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Invalid cart data provided." }, { status: 400 });
    }

    const { id, approveUrl } = await createOrder(cart);

    return NextResponse.json({ id, approveUrl });

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal order." }, 
      { status: 500 }
    );
  }
}

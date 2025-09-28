
import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("Create-order API Error: Cart is empty or invalid.");
      return NextResponse.json(
        { error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    console.log("API route /api/paypal/create-order received cart, calling createOrder helper.");
    const orderData = await createOrder(cartItems);

    console.log("API route /api/paypal/create-order successful, returning order ID:", orderData.id);
    return NextResponse.json(orderData);

  } catch (err: any) {
    console.error('PayPal API /create-order route error:', err);
    return NextResponse.json(
      { error: 'Failed to create PayPal order.', details: err.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

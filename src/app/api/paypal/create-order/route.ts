import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("Create order failed: Cart is empty or invalid.");
      return NextResponse.json({ error: "Cart is empty or invalid." }, { status: 400 });
    }

    // The createOrder function now expects an array of ProductInfo (id, name, price, quantity)
    // The price is in cents.
    const productInfoItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price, // price is already in cents from our products library
        quantity: item.quantity,
    }));

    const order = await createOrder(productInfoItems);

    // Return the full PayPal response to the frontend.
    // It contains the order ID and the approval link.
    return NextResponse.json(order);

  } catch (err: any) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: err.message || "Create order failed" }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { cartItems } = await req.json() as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
    }

    const orderData = await createOrder(cartItems);

    console.log("PayPal create-order successful. Returning Order ID:", orderData.id);

    return NextResponse.json(orderData);

  } catch (err: any) {
    console.error("PayPal API /create-order error:", err.message, err.stack);
    return NextResponse.json({ error: err.message || "An unexpected error occurred." }, { status: 500 });
  }
}

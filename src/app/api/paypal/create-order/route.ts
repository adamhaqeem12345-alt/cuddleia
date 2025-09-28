import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || cartItems.length === 0) {
      console.error("Create order failed: Cart is empty.");
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // Convert CartItem[] to ProductInfo[] for the API
    const productInfoItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
    }));

    const order = await createOrder(productInfoItems);

    return NextResponse.json(order);

  } catch (error) {
    console.error("Error in create-order route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to create order.", details: errorMessage }, { status: 500 });
  }
}

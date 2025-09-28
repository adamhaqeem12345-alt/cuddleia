import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import { ProductInfo } from '@/types/index';

export async function POST(req: Request) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: ProductInfo[] };

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const order = await createOrder(cartItems);

    return NextResponse.json(order);

  } catch (error) {
    console.error("Error in create-order route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to create order.", details: errorMessage }, { status: 500 });
  }
}

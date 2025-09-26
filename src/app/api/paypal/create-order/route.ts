
import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import { products } from '@/lib/products';

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/create-order received a request.");
  try {
    const { cart } = await request.json();
    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    const order = await createOrder(cart, products);

    return NextResponse.json({ id: order.id });

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

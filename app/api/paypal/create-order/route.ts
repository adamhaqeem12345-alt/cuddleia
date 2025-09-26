
import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/create-order");

  // Environment Variable Check
  if (!process.env.PAYPAL_API_URL || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("Configuration error: PayPal environment variables are not fully set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    
    const order = await createOrder(cart, allProducts);
    
    return NextResponse.json(order);

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

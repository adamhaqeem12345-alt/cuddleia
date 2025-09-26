'use server';

import { NextResponse } from 'next/server';
import { products as allProducts } from '@/lib/products';
import { createOrder } from '@/lib/paypal-api';

export async function POST(request: Request) {
  // Check for required environment variables
  if (!process.env.PAYPAL_CLIENT_SECRET || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    console.error("Configuration error: PayPal environment variables are not set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  
  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    
    // We must re-fetch product details on the server to ensure price integrity
    const order = await createOrder(cart, allProducts);
    return NextResponse.json(order);

  } catch (error: any) {
    console.error("API /create-order Error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

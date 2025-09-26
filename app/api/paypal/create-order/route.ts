import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';


export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/create-order");
  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    
    // We pass the full product list to the helper to ensure price integrity
    const order = await createOrder(cart, allProducts);
    
    return NextResponse.json(order);

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';
import { CartItem } from '@/context/cart-context';

export async function POST(request: Request) {
  try {
    const { cart } = await request.json();
    
    if (!cart || cart.length === 0) {
        return new NextResponse(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
    }
    
    const { json, status } = await createOrder(cart as CartItem[]);

    if (status === 201) {
        return NextResponse.json({ orderID: json.id });
    } else {
        return new NextResponse(JSON.stringify(json), { status });
    }
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}

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

    if (status >= 200 && status < 300) {
        return NextResponse.json({ orderID: json.id });
    } else {
        console.error("PayPal Create Order API Error:", json);
        const errorMessage = json.details?.[0]?.description || json.message || 'Failed to create PayPal order.';
        return new NextResponse(JSON.stringify({ error: errorMessage }), { status });
    }
  } catch (error: any) {
    console.error("Internal Server Error in create-order:", error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}

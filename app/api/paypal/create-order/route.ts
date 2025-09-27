
import { NextResponse } from 'next/server';
import { createOrder as createPayPalOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';

export async function POST(req: Request) {
    try {
        const { cart } = await req.json();

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: 'Invalid cart data.' }, { status: 400 });
        }
        
        const order = await createPayPalOrder(cart, allProducts);
        
        return NextResponse.json(order);

    } catch (error: any) {
        console.error('Failed to create order:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}

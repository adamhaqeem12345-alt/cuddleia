
import { createOrder } from '@/lib/paypal-api';
import { NextResponse } from 'next/server';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
    try {
        const { cart } = await req.json() as { cart: CartItem[] };

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid cart data' }, { status: 400 });
        }
        
        const order = await createOrder(cart);
        
        return NextResponse.json(order);

    } catch (error: any) {
        console.error('API_CREATE_ORDER_ERROR:', error.message);
        const details = error.details || 'No details available';
        return NextResponse.json({ error: 'Failed to create order.', details }, { status: 500 });
    }
}


import { createOrder } from '@/lib/paypal-api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { cart } = await req.json();

        if (!cart) {
            return NextResponse.json({ error: 'Missing cart data' }, { status: 400 });
        }
        
        const order = await createOrder(cart);
        
        return NextResponse.json(order);

    } catch (error: any) {
        console.error('API_CREATE_ORDER_ERROR:', error.message);
        return NextResponse.json({ error: 'Failed to create order.', details: error.message }, { status: 500 });
    }
}

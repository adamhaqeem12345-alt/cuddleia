
// app/api/paypal/create-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';

export async function POST(req: NextRequest) {
    try {
        const { subtotal } = await req.json();

        if (subtotal === undefined || subtotal <= 0) {
            return NextResponse.json({ success: false, error: 'Invalid subtotal' }, { status: 400 });
        }

        const order = await createOrder(subtotal);
        
        return NextResponse.json({ success: true, orderID: order.id }, { status: 200 });

    } catch (error) {
        console.error("Failed to create order:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Failed to create payment order: ${errorMessage}` }, { status: 500 });
    }
}

    
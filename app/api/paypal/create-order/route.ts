// app/api/paypal/create-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';

export async function POST(req: NextRequest) {
    try {
        const { total, currency } = await req.json();

        if (!total || !currency) {
            return NextResponse.json({ success: false, error: 'Missing total or currency' }, { status: 400 });
        }

        const { orderID, approveLink } = await createOrder(total, currency);
        
        return NextResponse.json({ success: true, orderID, approveLink }, { status: 200 });

    } catch (error) {
        console.error("Failed to create order:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Failed to create payment order: ${errorMessage}` }, { status: 500 });
    }
}

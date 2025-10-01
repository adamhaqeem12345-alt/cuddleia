// app/api/paypal/capture-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';
import { z } from 'zod';

const captureRequestSchema = z.object({
  orderID: z.string().min(1, { message: "Order ID is required." }),
});


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = captureRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { orderID } = validation.data;

        const captureData = await captureOrder(orderID);
        
        return NextResponse.json({ success: true, data: captureData }, { status: 200 });

    } catch (error) {
        console.error("Failed to capture order:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Failed to capture payment: ${errorMessage}` }, { status: 500 });
    }
}

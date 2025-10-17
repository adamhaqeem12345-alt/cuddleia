import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';

export async function POST(request: Request) {
    try {
        const { orderID } = await request.json();
        const { json, status } = await captureOrder(orderID);
        return new NextResponse(JSON.stringify(json), { status });
    } catch (error: any) {
        console.error("Capture Order Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}

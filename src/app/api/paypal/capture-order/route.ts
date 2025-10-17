import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';

export async function POST(request: Request) {
    try {
        const { orderID } = await request.json();
        const { json, status } = await captureOrder(orderID);

        if (status >= 200 && status < 300) {
            return new NextResponse(JSON.stringify(json), { status });
        } else {
            console.error("PayPal Capture Order API Error:", json);
            const errorMessage = json.details?.[0]?.description || json.message || 'Failed to capture PayPal order.';
            return new NextResponse(JSON.stringify({ error: errorMessage }), { status });
        }
    } catch (error: any) {
        console.error("Internal Server Error in capture-order:", error);
        return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

export async function POST(req: Request) {
    try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: 'Missing order ID.' }, { status: 400 });
        }
        
        // Capture the order. The email confirmation will be handled by the webhook.
        const capturedData = await captureOrder(orderID);

        return NextResponse.json(capturedData);

    } catch (error: any) {
        console.error('Failed to capture order:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}

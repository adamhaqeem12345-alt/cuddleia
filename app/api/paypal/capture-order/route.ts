
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

// This serverless function is called when the client-side detects
// that the user has approved the payment on the PayPal site.
export async function POST(req: Request) {
    try {
        const { orderID } = await req.json();

        if (!orderID || typeof orderID !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid order ID.' }, { status: 400 });
        }
        
        // Capture the order. The confirmation email will be handled by the webhook
        // to ensure it is only sent for successfully captured payments.
        const capturedData = await captureOrder(orderID);

        // Send back the captured data to the client, which can then redirect to the success page.
        return NextResponse.json(capturedData);

    } catch (error: any)
    {
        console.error('API Route Error: Failed to capture order:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}

    
// app/api/paypal/capture-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';

export async function POST(req: NextRequest) {
    try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ success: false, error: 'Missing orderID' }, { status: 400 });
        }

        const captureData = await captureOrder(orderID);

        // Here you would typically handle post-payment logic, like:
        // - Verifying the transaction details (e.g., amount) against your internal records
        // - Updating the order status in your database to "completed"
        // - Triggering an email with download links, etc.
        
        console.log('Payment captured successfully:', captureData);

        return NextResponse.json({ success: true, data: captureData }, { status: 200 });

    } catch (error) {
        console.error("Failed to capture order:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ success: false, error: `Failed to capture payment: ${errorMessage}` }, { status: 500 });
    }
}

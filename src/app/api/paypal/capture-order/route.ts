import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

export async function POST(req: Request) {
    try {
        const { orderID } = await req.json();
        if (!orderID) {
            console.error("Capture order failed: Missing orderID in request body.");
            return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
        }

        console.log(`Attempting to capture PayPal order: ${orderID}`);
        const capturedData = await captureOrder(orderID);
        
        // The captureOrder function in paypal-api.ts already logs the full response.
        // We can add a high-level log here for route-specific context.
        console.log(`Successfully captured order ${orderID}. Status: ${capturedData.status}`);

        // Return the full capture data to the client
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("PayPal API /capture-order route error:", err);
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during capture.";
        return NextResponse.json({ error: "Failed to capture PayPal order.", details: errorMessage }, { status: 500 });
    }
}

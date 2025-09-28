
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

export async function POST(req: Request) {
    console.log("API ROUTE: /api/paypal/capture-order received a POST request.");
    try {
        const { orderID } = await req.json();
        if (!orderID) {
            console.error("CAPTURE-ORDER API ERROR: Missing orderID in request body.");
            return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
        }

        console.log(`CAPTURE-ORDER: Calling captureOrder helper for orderID: ${orderID}`);
        const capturedData = await captureOrder(orderID);
        
        console.log(`CAPTURE-ORDER: Full response from PayPal captureOrder API:`, JSON.stringify(capturedData, null, 2));
        
        // Fulfillment logic has been removed to ensure build stability.
        if (capturedData.status === 'COMPLETED') {
            console.log(`CAPTURE-ORDER: Order ${orderID} is COMPLETED. Fulfillment should be handled manually or by a separate service.`);
        } else {
             console.warn(`CAPTURE-ORDER: Order ${orderID} status is '${capturedData.status}', not 'COMPLETED'.`);
        }
        
        // Return the full capture data to the client immediately.
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("CAPTURE-ORDER API CATCH BLOCK: An unexpected error occurred.", err);
        const errorMessage = err.message || "An unexpected error occurred during capture.";
        return NextResponse.json({ error: "Failed to capture PayPal order.", details: errorMessage }, { status: 500 });
    }
}

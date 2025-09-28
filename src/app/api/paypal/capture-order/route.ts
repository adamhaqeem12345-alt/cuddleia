
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';
import { fulfillOrder } from '@/lib/fulfillment';

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
        
        // Fulfill the order only if the capture is fully completed.
        if (capturedData.status === 'COMPLETED') {
            console.log(`CAPTURE-ORDER: Order ${orderID} is COMPLETED. Awaiting fulfillment...`);
            
            // Await the fulfillment process to complete before responding to the client.
            // This ensures the order is marked as processed in the database, preventing
            // a race condition with the webhook.
            await fulfillOrder(capturedData);

        } else {
             console.warn(`CAPTURE-ORDER: Order ${orderID} status is '${capturedData.status}', not 'COMPLETED'. Order will not be fulfilled immediately.`);
        }
        
        // Return the full capture data to the client immediately.
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("CAPTURE-ORDER API CATCH BLOCK: An unexpected error occurred.", err);
        const errorMessage = err.message || "An unexpected error occurred during capture.";
        // Ensure the fulfillment error is included in the response if it's relevant
        const errorDetails = err.message.includes("fulfillment") ? err.message : errorMessage;
        return NextResponse.json({ error: "Failed to capture or fulfill PayPal order.", details: errorDetails }, { status: 500 });
    }
}

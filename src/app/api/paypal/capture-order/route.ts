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
            console.log(`CAPTURE-ORDER: Order ${orderID} is COMPLETED. Fulfilling order...`);
            
            // Call the centralized fulfillment function.
            // This will handle sending the email with download links.
            // We'll run this and not wait for it to complete before responding to the client,
            // but we will catch any immediate errors.
            fulfillOrder(capturedData).catch(err => {
                // This logs the fulfillment error on the server but doesn't block the client response.
                // The webhook will act as a failsafe.
                console.error(`CAPTURE-ORDER: Post-capture fulfillment failed for order ${orderID}. This will be retried by the webhook. Error:`, err);
            });

        } else {
             console.warn(`CAPTURE-ORDER: Order ${orderID} status is '${capturedData.status}', not 'COMPLETED'. Order will not be fulfilled immediately.`);
        }
        
        // Return the full capture data to the client immediately.
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("CAPTURE-ORDER API CATCH BLOCK: An unexpected error occurred.", err);
        const errorMessage = err.message || "An unexpected error occurred during capture.";
        return NextResponse.json({ error: "Failed to capture PayPal order.", details: errorMessage }, { status: 500 });
    }
}
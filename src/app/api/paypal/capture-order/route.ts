
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

export async function POST(req: Request) {
    try {
        const { orderID } = await req.json();
        if (!orderID) {
            return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
        }

        const capturedData = await captureOrder(orderID);
        
        console.log("Full PayPal capture-order response:", JSON.stringify(capturedData, null, 2));

        if (capturedData.status !== 'COMPLETED') {
            throw new Error(`Capture status was not COMPLETED: ${capturedData.status}`);
        }
        
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("PayPal API /capture-order error:", err.message);
        return NextResponse.json({ error: err.message || "Capture order failed" }, { status: 500 });
    }
}

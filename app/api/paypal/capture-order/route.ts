
import { captureOrder } from '@/lib/paypal-api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
     try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
        }

        const captureData = await captureOrder(orderID);

        // Optionally: Trigger fulfillment logic here (e.g., send email, log purchase)
        // For now, we just return the capture data.

        return NextResponse.json(captureData);

    } catch (error: any) {
        console.error('API_CAPTURE_ORDER_ERROR:', error.message);
        return NextResponse.json({ error: 'Failed to capture order.', details: error.message }, { status: 500 });
    }
}

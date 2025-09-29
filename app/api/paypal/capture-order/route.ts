
import { captureOrder } from '@/lib/paypal-api';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
     try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
        }

        const captureData = await captureOrder(orderID);

        return NextResponse.json(captureData);

    } catch (error: any) {
        console.error('API_CAPTURE_ORDER_ERROR:', error.message);
        const details = error.details || 'No details available';
        return NextResponse.json({ error: 'Failed to capture order.', details }, { status: 500 });
    }
}

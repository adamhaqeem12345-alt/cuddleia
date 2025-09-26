// /src/app/api/paypal/capture-order/route.ts
import { NextResponse } from 'next/server';

async function getAccessToken() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`https://api-m.paypal.com/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
    try {
        const accessToken = await getAccessToken();
        const { orderID } = await request.json();

        const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const capturedData = await response.json();

        if (capturedData.status === 'COMPLETED') {
            return NextResponse.json(capturedData);
        } else {
            throw new Error(capturedData.details?.[0]?.description || 'Payment not completed');
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

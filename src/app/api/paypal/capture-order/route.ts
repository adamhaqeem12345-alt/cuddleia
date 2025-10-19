
import { NextRequest, NextResponse } from 'next/server';

const getPayPalAccessToken = async (): Promise<string> => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error('PayPal client ID or secret is not configured.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token'; // Use sandbox URL

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to get PayPal access token:', errorBody);
        throw new Error('Failed to authenticate with PayPal.');
    }

    const data = await response.json();
    return data.access_token;
};


export async function POST(req: NextRequest) {
    try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: 'orderID is required.' }, { status: 400 });
        }

        const accessToken = await getPayPalAccessToken();
        const url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok && data.status === 'COMPLETED') {
            // Payment is successful
            // You can add logic here to save order details to a database,
            // send a confirmation email, grant access to digital products, etc.
            console.log('Payment captured successfully:', data);
            return NextResponse.json({ success: true, order: data });
        } else {
             // Handle cases where capture might be pending or failed
            console.error('Failed to capture PayPal payment:', data);
            throw new Error(data.message || 'Failed to capture payment.');
        }

    } catch (error: any) {
        console.error('Capture PayPal Order Error:', error);
        return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}

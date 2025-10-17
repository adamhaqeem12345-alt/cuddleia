import { NextResponse } from 'next/server';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_ENV } = process.env;

const getPayPalAccessToken = async () => {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const url = PAYPAL_API_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token' : 'https://api-m.paypal.com/v1/oauth2/token';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get PayPal access token: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.access_token;
};


export async function POST(request: Request) {
    try {
        const { orderID } = await request.json();
        const accessToken = await getPayPalAccessToken();
        const url = PAYPAL_API_ENV === 'sandbox' 
            ? `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`
            : `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        
        const data = await response.json();

        if (response.ok && data.status === 'COMPLETED') {
             return NextResponse.json(data);
        } else {
             return new NextResponse(JSON.stringify(data || { error: 'Failed to capture order' }), { status: response.status });
        }

    } catch (error: any) {
        console.error("Capture Order Error:", error);
        return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
}

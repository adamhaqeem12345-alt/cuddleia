'use server';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET || !PAYPAL_API_URL) {
    throw new Error("PayPal environment variables are not set correctly.");
}

export async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to get PayPal access token: ${errorDetails}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function createOrder(total: number) {
    try {
        const accessToken = await getAccessToken();
        
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: total.toFixed(2),
                    },
                }],
            }),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Failed to create PayPal order: ${errorDetails}`);
        }

        const order = await response.json();
        return order.id;

    } catch (error: any) {
        console.error("Error creating PayPal order:", error);
        throw error;
    }
}


export async function captureOrder(orderID: string) {
    try {
        const accessToken = await getAccessToken();

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Failed to capture PayPal order: ${errorDetails}`);
        }

        const capturedData = await response.json();
        return capturedData;

    } catch (error: any) {
        console.error("Error capturing PayPal order:", error);
        throw error;
    }
}


export async function getOrderDetails(orderId: string) {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            cache: 'no-store'
        });
        if (!response.ok) {
            console.error(`Failed to get order details for ${orderId}:`, await response.text());
            return null;
        }
        const orderData = await response.json();
        return orderData;
    } catch(e) {
        console.error("Error fetching order details:", e);
        return null;
    }
}

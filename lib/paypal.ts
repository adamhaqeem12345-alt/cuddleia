
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for production

// ===================================================================================
// CRITICAL: URL CONFIGURATION - MUST BE UPDATED BEFORE GOING LIVE
// ===================================================================================
const returnUrl = 'https://www.cuddleia.com/cart'; // PRODUCTION URL: Replace with your order confirmation/success page
const cancelUrl = 'https://www.cuddleia.com/checkout'; // PRODUCTION URL: Replace with your checkout page
// ===================================================================================


export async function getPayPalAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('MISSING_PAYPAL_CREDENTIALS');
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to get PayPal access token: ${errorDetails}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function createPayPalOrder(accessToken: string, total: number) {
    const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: total.toFixed(2), // Ensure value is a string with two decimal places
                },
            },
        ],
        application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
            brand_name: 'Cuddleia',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
        },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `CUDDLEIA-${Date.now()}`,
        },
        body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        console.error('PayPal API Error:', JSON.stringify(errorDetails, null, 2));
        throw new Error(`PayPal API responded with status ${response.status}. Details: ${JSON.stringify(errorDetails)}`);
    }

    return response.json();
}

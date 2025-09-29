
// Use the live PayPal API endpoint for production
const PAYPAL_API = 'https://api-m.paypal.com';

/**
 * Fetches a PayPal access token for API calls.
 * This function safely accesses environment variables at runtime.
 */
async function getPayPalAccessToken(): Promise<string> {
    // These credentials are server-side only and should be accessed only when the function is called.
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('MISSING_PAYPAL_API_CREDENTIALS');
    }
    
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const url = `${PAYPAL_API}/v1/oauth2/token`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to get PayPal access token:', JSON.stringify(errorData, null, 2));
            throw new Error('Failed to authenticate with PayPal.');
        }

        const data = await response.json();
        return data.access_token;

    } catch (error: any) {
        console.error('Error fetching PayPal access token:', error.message);
        throw new Error('Failed to authenticate with PayPal.');
    }
}

/**
 * Captures a payment for a PayPal order.
 * @param orderID - The ID of the order to capture.
 */
export async function captureOrder(orderID: string) {
    const accessToken = await getPayPalAccessToken();
    const url = `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            cache: 'no-store'
        });

        const data = await response.json();
        
         if (!response.ok) {
            console.error('Failed to capture PayPal order:', JSON.stringify(data, null, 2));
            const error: any = new Error('Failed to capture PayPal order.');
            error.details = data;
            throw error;
        }
        
        return data;

    } catch (error: any) {
        console.error('Error capturing PayPal order:', error.message);
        throw error;
    }
}

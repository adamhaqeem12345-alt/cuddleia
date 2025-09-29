
import type { CartItem } from './types';

// These credentials are server-side only and should be set in your environment
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
// Use the live PayPal API endpoint for production
const PAYPAL_API = 'https://api-m.paypal.com';

/**
 * Fetches a PayPal access token for API calls.
 */
async function getPayPalAccessToken(): Promise<string> {
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
 * Creates a PayPal order on the server-side.
 * @param cart - The user's shopping cart items.
 */
export async function createOrder(cart: CartItem[]) {
    if (!cart || cart.length === 0) {
        throw new Error("Cart is empty.");
    }

    const accessToken = await getPayPalAccessToken();
    const url = `${PAYPAL_API}/v2/checkout/orders`;

    const totalValue = cart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0).toFixed(2);

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: totalValue,
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: totalValue
                    }
                }
            },
            items: cart.map(item => ({
                name: item.name,
                unit_amount: {
                    currency_code: 'USD',
                    value: (item.price / 100).toFixed(2)
                },
                quantity: item.quantity.toString()
            }))
        }],
         application_context: {
            brand_name: 'Cuddleia',
            shipping_preference: 'NO_SHIPPING',
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to create PayPal order:', JSON.stringify(data, null, 2));
            const errorDetails = data.details || [{ issue: 'Unknown issue', description: 'No description from PayPal.' }];
            const message = `Failed to create PayPal order: ${errorDetails[0].issue} - ${errorDetails[0].description}`;
            const error: any = new Error(message);
            error.details = data;
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error('Error creating PayPal order:', error.message);
        throw error; // Re-throw the error to be caught by the API route
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

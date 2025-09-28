
import type { CartItem } from './types';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';

/**
 * Fetches a PayPal access token for API calls.
 * Uses Basic Authentication with Client ID and Secret.
 */
async function getPayPalAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('MISSING_PAYPAL_API_CREDENTIALS');
    }
    
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    try {
        const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
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
            console.error('Failed to get PayPal access token:', errorData);
            throw new Error('Failed to authenticate with PayPal.');
        }

        const data = await response.json();
        return data.access_token;

    } catch (error: any) {
        console.error('Failed to get PayPal access token:', error.message);
        throw new Error('Failed to authenticate with PayPal.');
    }
}

/**
 * Creates a PayPal order.
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

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to create PayPal order:', errorData);
            throw new Error('Failed to create PayPal order.');
        }

        const data = await response.json();
        return {
            id: data.id,
            status: data.status,
            links: data.links,
        };
    } catch (error: any) {
        console.error('Failed to create PayPal order:', error.message);
        throw new Error('Failed to create PayPal order.');
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

         if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to capture PayPal order:', errorData);
            throw new Error('Failed to capture PayPal order.');
        }
        
        const data = await response.json();
        return data;

    } catch (error: any) {
        console.error('Failed to capture PayPal order:', error.message);
        throw new Error('Failed to capture PayPal order.');
    }
}

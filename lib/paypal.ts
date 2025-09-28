import type { CartItem } from './types';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Live PayPal API

/**
 * Generates an OAuth 2.0 access token for authenticating with PayPal's API.
 * @see https://developer.paypal.com/reference/get-an-access-token/
 */
async function getAccessToken(): Promise<string> {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('MISSING_PAYPAL_API_CREDENTIALS');
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get access token: ${data.error_description || 'Unknown error'}`);
    }
    
    return data.access_token;
}

/**
 * Creates a new order with the PayPal API.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
export async function createOrder(cart: CartItem[]): Promise<string> {
    const accessToken = await getAccessToken();
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders`;

    const totalValue = cart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0).toFixed(2);
    
    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: totalValue,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: totalValue,
                        },
                    },
                },
                items: cart.map(item => ({
                    name: item.name,
                    quantity: String(item.quantity),
                    unit_amount: {
                        currency_code: 'USD',
                        value: (item.price / 100).toFixed(2),
                    },
                    category: 'DIGITAL_GOODS'
                })),
            },
        ],
        application_context: {
            brand_name: 'Cuddleia',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const errorDetails = JSON.stringify(data, null, 2);
        throw new Error(`Failed to create order. Status: ${response.status}. Details: ${errorDetails}`);
    }
    
    return data.id; // The ID of the created order
}


/**
 * Captures a payment for an approved order.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
export async function captureOrder(orderId: string): Promise<{ customerEmail: string | undefined; customerName: string; orderId: string; total: number; }> {
    const accessToken = await getAccessToken();
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to capture order. Status: ${response.status}. Details: ${data.message || 'Unknown error'}`);
    }
    
    if (data.status !== 'COMPLETED') {
        throw new Error(`Order capture did not complete. Status: ${data.status}`);
    }

    const purchaseUnit = data.purchase_units[0];
    const payer = data.payer;
    const total = parseFloat(purchaseUnit.payments.captures[0].amount.value);
    
    return {
        customerEmail: payer.email_address,
        customerName: `${payer.name.given_name} ${payer.name.surname}`.trim(),
        orderId: data.id,
        total: total,
    };
}

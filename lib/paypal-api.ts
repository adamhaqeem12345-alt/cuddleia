
import type { Product } from '@/lib/types';

// This is a self-contained helper function to get a PayPal access token.
async function getAccessToken() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

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
        throw new Error(`Failed to get PayPal access token: ${await response.text()}`);
    }
    const data = await response.json();
    return data.access_token;
}

// Creates a PayPal order
export async function createOrder(cart: { id: string; quantity: number }[], allProducts: Product[]) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    let total = 0;
    const items = cart.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.id);
        if (!product) {
            throw new Error(`Product with ID ${cartItem.id} not found.`);
        }
        total += product.price * cartItem.quantity;
        return {
            name: product.name,
            quantity: String(cartItem.quantity),
            unit_amount: {
                currency_code: 'USD',
                value: String(product.price.toFixed(2)),
            },
            sku: product.id,
        };
    });

     if (total <= 0) {
      throw new Error('Invalid total amount for order.');
    }

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
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: total.toFixed(2),
                        }
                    }
                },
                items: items,
            }],
        }),
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        console.error(`Failed to create PayPal order:`, errorDetails);
        throw new Error(`Failed to create PayPal order: ${errorDetails}`);
    }

    return response.json();
}

// Captures a PayPal order
export async function captureOrder(orderID: string) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    
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
        console.error(`Failed to capture PayPal order:`, errorDetails);
        throw new Error(`Failed to capture PayPal order: ${errorDetails}`);
    }

    return response.json();
}

// Verifies a PayPal webhook signature
export async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
    const accessToken = await getAccessToken();
    const body = JSON.parse(rawBody);

    const verificationBody = {
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: WEBHOOK_ID,
        webhook_event: body,
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationBody),
        cache: 'no-store',
    });
    
    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}

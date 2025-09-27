
import type { Product } from '@/lib/types';

// This is a self-contained helper function to get a PayPal access token.
export async function getAccessToken() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('MISSING_PAYPAL_API_CREDENTIALS');
    }

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
        const errorDetails = await response.json();
        throw new Error(`Failed to get PayPal access token: ${errorDetails.error_description || JSON.stringify(errorDetails)}`);
    }

    const data = await response.json();
    return data.access_token;
}

// Creates a PayPal order
export async function createOrder(cart: { id: string; quantity: number }[], allProducts: Product[]) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Use cents to avoid floating point issues
    let itemTotalInCents = 0;

    const items = cart.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.id);
        if (!product) {
            throw new Error(`Product with ID ${cartItem.id} not found.`);
        }
        
        // Convert product price to cents
        const priceInCents = Math.round(product.price * 100);
        itemTotalInCents += priceInCents * cartItem.quantity;
        
        // Sanitize all fields before sending to PayPal to prevent validation errors.
        const cleanName = (product.name || '').replace(/(\r\n|\n|\r)/gm, " ").substring(0, 127);
        const cleanDescription = (product.description || '').replace(/(\r\n|\n|\r)/gm, " ").substring(0, 127);
        const cleanSku = (product.id || '').substring(0, 127);

        return {
            name: cleanName,
            description: cleanDescription,
            sku: cleanSku,
            unit_amount: {
                currency_code: 'USD',
                value: (priceInCents / 100).toFixed(2), // Convert back to string format for PayPal
            },
            quantity: String(cartItem.quantity),
        };
    });

    if (itemTotalInCents <= 0) {
      throw new Error('Invalid total amount for order.');
    }

    const finalTotalValue = (itemTotalInCents / 100).toFixed(2);

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: finalTotalValue,
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: finalTotalValue,
                    }
                }
            },
            items: items,
        }],
         application_context: {
            brand_name: 'Cuddleia',
            locale: 'en-US',
            landing_page: 'GUEST_CHECKOUT',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${baseUrl}/checkout/success`,
            cancel_url: `${baseUrl}/`,
        },
    };

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `cuddleia-order-${Date.now()}`
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
    });

    const orderData = await response.json();
    if (!response.ok) {
        const errorDetail = orderData?.details?.[0]?.description || JSON.stringify(orderData);
        throw new Error(`Failed to create PayPal order: ${errorDetail}`);
    }

    return orderData;
}

// Captures a PayPal order
export async function captureOrder(orderID: string) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
    
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `cuddleia-capture-${orderID}-${Date.now()}`
        },
        cache: 'no-store'
    });

    const capturedData = await response.json();
    if (!response.ok) {
        if (capturedData.name === 'ORDER_ALREADY_CAPTURED' || capturedData.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
            console.warn(`Order ${orderID} was already captured.`);
            const orderDetails = await getOrderDetails(orderID);
             return orderDetails;
        }
        const errorDetail = capturedData.details?.[0]?.description || JSON.stringify(capturedData);
        throw new Error(`Failed to capture PayPal order: ${errorDetail}`);
    }

    return capturedData;
}


// Function to get order details, useful if an order is already captured
export async function getOrderDetails(orderID: string) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    const orderData = await response.json();
     if (!response.ok) {
        const errorDetail = orderData.details?.[0]?.description || JSON.stringify(orderData);
        throw new Error(`Failed to get PayPal order details: ${errorDetail}`);
    }
    return orderData;
}


// Verifies a webhook signature
export async function verifyWebhookSignature(req: Request): Promise<boolean> {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
    const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

    if (!WEBHOOK_ID) {
        throw new Error('PayPal webhook ID is not configured.');
    }

    const reqBody = await req.text(); 
    const headers = req.headers;

    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transmission_id: headers.get('paypal-transmission-id'),
            transmission_time: headers.get('paypal-transmission-time'),
            cert_url: headers.get('paypal-cert-url'),
            auth_algo: headers.get('paypal-auth-algo'),
            transmission_sig: headers.get('paypal-transmission-sig'),
            webhook_id: WEBHOOK_ID,
            webhook_event: JSON.parse(reqBody),
        }),
        cache: 'no-store'
    });

    const verification = await response.json();
    return verification.verification_status === 'SUCCESS';
}

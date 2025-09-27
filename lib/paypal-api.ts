
import type { Product, CartItem } from '@/lib/types';

// This is a self-contained helper function to get a PayPal access token.
// It is designed to be robust and provide clear error messages.
async function getAccessToken() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('FATAL: Missing PayPal API credentials.');
        throw new Error('MISSING_PAYPAL_API_CREDENTIALS');
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
        const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store'
        });

        const data = await response.json();

        if (!response.ok) {
            const errorDescription = data.error_description || JSON.stringify(data);
            console.error(`Failed to get PayPal access token: ${errorDescription}`);
            throw new Error('Failed to authenticate with PayPal.');
        }

        return data.access_token;

    } catch (error: any) {
        console.error('Network or other error while getting PayPal access token:', error);
        throw new Error('Could not connect to PayPal to get access token.');
    }
}


/**
 * Creates a PayPal order.
 * This function is completely rebuilt to ensure precision and compliance.
 * It uses integer math for all financial calculations to prevent floating-point errors.
 */
export async function createOrder(cart: CartItem[], allProducts: Product[]) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    let itemTotalInCents = 0;

    const items = cart.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.id);
        if (!product) {
            console.error(`Product with ID ${cartItem.id} not found in cart during order creation.`);
            throw new Error(`Product with ID ${cartItem.id} not found.`);
        }
        
        // --- PRECISION AND SANITIZATION ---
        // 1. Use integers (cents) for all financial calculations to avoid floating point errors.
        const priceInCents = Math.round(product.price * 100);
        itemTotalInCents += priceInCents * cartItem.quantity;
        
        // 2. Sanitize all string fields to be compliant with PayPal's API.
        const cleanName = (product.name || 'Unnamed Product').replace(/(\r\n|\n|\r)/gm, " ").substring(0, 127);
        const cleanDescription = (product.description || 'No description').replace(/(\r\n|\n|\r)/gm, " ").substring(0, 127);
        const cleanSku = (product.id || `SKU-${Date.now()}`).substring(0, 127);

        return {
            name: cleanName,
            description: cleanDescription,
            sku: cleanSku,
            unit_amount: {
                currency_code: 'USD',
                // Convert back to string format for PayPal API ONLY at the last moment.
                value: (priceInCents / 100).toFixed(2),
            },
            quantity: String(cartItem.quantity),
        };
    });

    if (itemTotalInCents <= 0) {
      throw new Error('Invalid total amount for order. Total must be positive.');
    }

    // Convert the final integer total back to a string for the API.
    const finalTotalValue = (itemTotalInCents / 100).toFixed(2);

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: finalTotalValue,
                // The breakdown is critical for validation. It ensures the sum of items equals the total.
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
            cancel_url: `${baseUrl}/cart`, // Return user to cart on cancellation.
        },
    };

    try {
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                // Use a unique request ID for idempotency and debugging.
                'PayPal-Request-Id': `cuddleia-order-${Date.now()}`
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        });

        const orderData = await response.json();
        if (!response.ok) {
            // Provide a more detailed error message for debugging.
            const errorDetail = orderData?.details?.[0]?.description || JSON.stringify(orderData);
            console.error("PayPal Error when creating order:", errorDetail);
            // This is the error message that will be shown to the user.
            throw new Error(orderData.message || `Failed to create PayPal order. Please check your cart and try again.`);
        }

        return orderData;

    } catch (error: any) {
        console.error("Network or other error during order creation:", error.message);
        throw new Error(error.message || 'An unexpected error occurred while communicating with PayPal.');
    }
}

/**
 * Captures a PayPal order.
 * This function is rebuilt to handle idempotency correctly.
 */
export async function captureOrder(orderID: string) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
    
    try {
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
            // If the order was already captured, this is not a fatal error. 
            // We can fetch the existing order details instead. This is key for webhook reliability.
            if (capturedData.name === 'ORDER_ALREADY_CAPTURED' || capturedData.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
                console.warn(`Order ${orderID} was already captured. Fetching existing details.`);
                return getOrderDetails(orderID);
            }
            const errorDetail = capturedData.details?.[0]?.description || JSON.stringify(capturedData);
            console.error(`Failed to capture PayPal order ${orderID}: ${errorDetail}`);
            throw new Error(`Failed to capture PayPal order.`);
        }
        
        return capturedData;

    } catch (error: any) {
        console.error(`Network or other error capturing order ${orderID}:`, error.message);
        throw new Error('An unexpected error occurred while capturing the payment.');
    }
}


/**
 * Function to get order details, useful if an order is already captured.
 * This is rebuilt for clarity and better error handling.
 */
export async function getOrderDetails(orderID: string) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');

    try {
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
            console.error(`Failed to get PayPal order details for ${orderID}: ${errorDetail}`);
            throw new Error(`Failed to get PayPal order details.`);
        }
        return orderData;

    } catch (error: any) {
        console.error(`Network or other error getting order details for ${orderID}:`, error.message);
        throw new Error('An unexpected error occurred while fetching order details.');
    }
}


/**
 * Verifies a webhook signature.
 * This is rebuilt to be secure and compliant.
 */
export async function verifyWebhookSignature(req: Request): Promise<boolean> {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = (process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com').replace(/\/$/, '');
    const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

    if (!WEBHOOK_ID) {
        console.error('FATAL: PayPal webhook ID is not configured.');
        throw new Error('PayPal webhook ID is not configured.');
    }

    // Must clone the request to read the body, as it can only be read once.
    const reqClone = req.clone();
    const reqBody = await reqClone.text(); 
    const headers = req.headers;

    try {
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
    } catch (error: any) {
        console.error('Error verifying webhook signature:', error.message);
        return false;
    }
}

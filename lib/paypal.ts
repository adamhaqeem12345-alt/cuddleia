/**
 * @file This file contains the core logic for interacting with the PayPal v2 Orders API.
 * It includes functions for creating an order, capturing an order, and generating an access token.
 */

import { products } from './products';
import { sendOrderConfirmationEmail } from './email';

interface CartItem {
    id: string;
    quantity: number;
}

// Ensure environment variables are loaded and typed.
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal client ID or secret is not configured in environment variables.");
}

/**
 * Generates a PayPal API access token.
 * @returns {Promise<string>} The access token.
 */
async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get access token: ${data.error_description || 'Unknown error'}`);
    }
    return data.access_token;
}


/**
 * Creates a PayPal order based on the items in the cart.
 * The server looks up product details from a secure source (`lib/products.ts`).
 * @param {CartItem[]} cart - A simplified cart containing only product IDs and quantities.
 * @returns {Promise<{id: string, approveUrl: string}>} The order ID and the URL for user approval.
 */
export async function createOrder(cart: CartItem[]): Promise<{ id: string; approveUrl: string }> {
    if (!cart || cart.length === 0) {
        throw new Error('Cart is empty.');
    }

    const itemsPayload = cart.map((cartItem) => {
        const productDetails = products.find(p => p.id === cartItem.id);
        if (!productDetails) {
            throw new Error(`Product with ID ${cartItem.id} not found.`);
        }

        // Use the actual product name and ID, simply truncated. No complex regex.
        const itemName = productDetails.name.substring(0, 127);
        const itemSku = productDetails.id.substring(0, 127);

        return {
            name: itemName,
            sku: itemSku,
            unit_amount: {
                currency_code: 'USD',
                value: (productDetails.price / 100).toFixed(2),
            },
            quantity: String(cartItem.quantity),
            category: 'DIGITAL_GOODS' as const,
        };
    });

    // Calculate the total by reducing the items array to prevent floating point issues.
    const totalValue = itemsPayload.reduce((sum, item) => {
        return sum + (parseFloat(item.unit_amount.value) * parseInt(item.quantity, 10));
    }, 0).toFixed(2);
    

    const accessToken = await getAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
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
            items: itemsPayload,
        }],
        application_context: {
            return_url: `${siteUrl}/checkout/success`,
            cancel_url: `${siteUrl}/cart`,
            brand_name: 'Cuddleia',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
        },
    };

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'PayPal-Request-Id': `cuddleia-order-${Date.now()}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error('PayPal createOrder Error:', JSON.stringify(data, null, 2));
        const details = data.details?.[0];
        const errorMessage = details ? `${details.issue}: ${details.description}` : (data.message || 'Failed to create order.');
        throw new Error(errorMessage);
    }
    
    const approveUrl = data.links?.find((link: any) => link.rel === 'approve')?.href;
    if (!approveUrl) {
        throw new Error('Could not find PayPal approval URL.');
    }

    return { id: data.id, approveUrl };
}

/**
 * Captures a payment for a given PayPal order ID.
 * @param {string} orderId The PayPal order ID.
 * @returns {Promise<any>} The captured order details.
 */
export async function captureOrder(orderId: string): Promise<any> {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'PayPal-Request-Id': `cuddleia-capture-${Date.now()}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
         console.error('PayPal captureOrder Error:', JSON.stringify(data, null, 2));
        const details = data.details?.[0];
        const errorMessage = details ? `${details.issue}: ${details.description}` : (data.message || 'Failed to capture order.');
        throw new Error(errorMessage);
    }

    // --- Post-Payment Logic ---
    if (data.status === 'COMPLETED') {
        const purchaseUnit = data.purchase_units[0];
        const total = parseFloat(purchaseUnit.payments.captures[0].amount.value);
        const customerName = data.payer.name.given_name || 'Valued Customer';
        const customerEmail = data.payer.email_address;
        
        const purchasedItems = purchaseUnit.items.map((item: any) => {
            const product = products.find(p => p.id === item.sku);
            if (!product) {
                // This should not happen if createOrder was successful.
                return { name: item.name, quantity: parseInt(item.quantity), downloadUrl: '', price: parseFloat(item.unit_amount.value) };
            }
            return {
                name: product.name,
                quantity: parseInt(item.quantity, 10),
                downloadUrl: product.downloadUrl,
                price: product.price / 100, // convert cents to dollars
            };
        });

        // Send confirmation email asynchronously. Don't block the response.
        sendOrderConfirmationEmail({
            customerName,
            customerEmail,
            total,
            orderId: data.id,
            products: purchasedItems,
        }).catch(err => {
            console.error("Failed to send confirmation email:", err);
            // Don't throw an error here, as the payment itself was successful.
        });
        
        return { 
            orderId: data.id,
            customerName,
            total: `$${total.toFixed(2)}`,
            products: purchasedItems.map(p => ({ name: p.name, downloadUrl: p.downloadUrl })) 
        };
    }

    return data;
}

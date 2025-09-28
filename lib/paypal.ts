/**
 * @file This file contains the core logic for interacting with the PayPal v2 Orders API.
 * It includes functions for creating an order, capturing an order, and generating an access token.
 */

import { products } from './products';
import { sendOrderConfirmationEmail } from './email';

interface CartItemFromClient {
    id: string;
    quantity: number;
    price: number; // Price in cents
    name: string;
}

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal client ID or secret is not configured in environment variables.");
}

async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Failed to get access token: ${data.error_description || 'Unknown error'}`);
    return data.access_token;
}

export async function createOrder(cart: CartItemFromClient[]): Promise<{ id: string; approveUrl: string }> {
    if (!cart || cart.length === 0) {
        throw new Error('Cart is empty.');
    }

    const accessToken = await getAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const itemsPayload = cart.map((cartItem) => {
        const cleanedName = cartItem.name.replace(/[^\w\s-]/g, '').substring(0, 127);
        return {
            name: cleanedName,
            sku: cartItem.id.substring(0, 127),
            unit_amount: {
                currency_code: 'USD',
                value: (cartItem.price / 100).toFixed(2),
            },
            quantity: String(cartItem.quantity),
            category: 'DIGITAL_GOODS' as const,
        };
    });

    const totalValue = itemsPayload.reduce((sum, item) => {
        return sum + (parseFloat(item.unit_amount.value) * parseInt(item.quantity, 10));
    }, 0).toFixed(2);

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: totalValue,
                breakdown: {
                    item_total: { currency_code: 'USD', value: totalValue },
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

    if (data.status === 'COMPLETED') {
        const purchaseUnit = data.purchase_units[0];
        const total = parseFloat(purchaseUnit.payments.captures[0].amount.value);
        const customerName = data.payer.name.given_name || 'Valued Customer';
        const customerEmail = data.payer.email_address;
        
        const purchasedItems = purchaseUnit.items.map((item: any) => {
            const product = products.find(p => p.id === item.sku);
            if (!product) {
                return { name: item.name, quantity: parseInt(item.quantity), downloadUrl: '', price: parseFloat(item.unit_amount.value) };
            }
            return {
                name: product.name,
                quantity: parseInt(item.quantity, 10),
                downloadUrl: product.downloadUrl,
                price: product.price / 100,
            };
        });

        sendOrderConfirmationEmail({
            customerName,
            customerEmail,
            total,
            orderId: data.id,
            products: purchasedItems,
        }).catch(err => {
            console.error("Failed to send confirmation email:", err);
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

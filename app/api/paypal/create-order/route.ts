
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for production

async function getAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    return data.access_token;
}

export async function POST(req: NextRequest) {
    try {
        const { total, items, orderId } = await req.json();
        const accessToken = await getAccessToken();

        const payload = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: String(total),
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: String(total),
                        }
                    }
                },
                items: items.map((item: Product) => ({
                    name: item.name,
                    quantity: '1',
                    unit_amount: {
                        currency_code: 'USD',
                        value: String(item.price),
                    },
                    sku: item.id,
                })),
                invoice_id: orderId, // Use the unique order ID as the invoice ID
                custom_id: orderId, // Also store it in custom_id for reference
            }],
             application_context: {
                brand_name: 'Cuddleia',
                landing_page: 'LOGIN',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
            },
        };

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'PayPal-Request-Id': orderId, // Helps prevent duplicate order creation
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("PayPal API Error:", data);
            const errorMessage = data.details?.[0]?.description || 'Failed to create PayPal order.';
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        return NextResponse.json({ id: data.id });

    } catch (error) {
        console.error("Internal Server Error:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Could not create order: ${errorMessage}` }, { status: 500 });
    }
}

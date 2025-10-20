
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

const getPayPalAccessToken = async (): Promise<string> => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error('PayPal client ID or secret is not configured.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token'; // Use sandbox URL

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to get PayPal access token:', errorBody);
        throw new Error('Failed to authenticate with PayPal.');
    }

    const data = await response.json();
    return data.access_token;
};


export async function POST(req: NextRequest) {
    try {
        const { cart, totalAmountUSD, name, email, phone } = (await req.json()) as { cart: CartItem[], totalAmountUSD: number, name: string, email: string, phone: string };

        if (!cart || cart.length === 0 || totalAmountUSD === undefined) {
            return NextResponse.json({ error: 'Cart and total amount are required.' }, { status: 400 });
        }

        const finalTotal = totalAmountUSD.toFixed(2);

        // Allow $0 if cart has items (e.g. 100% discount on free item)
        // But do not allow negative amounts.
        if (parseFloat(finalTotal) < 0) {
            return NextResponse.json({ error: 'Total amount cannot be negative.' }, { status: 400 });
        }
        
        // This payload will be stored in PayPal's system and returned with the webhook
        const customIdPayload = {
            cart: cart.map(item => ({ id: item.id, quantity: item.quantity })),
            name,
            email,
            phone
        }

        const accessToken = await getPayPalAccessToken();
        const url = 'https://api-m.sandbox.paypal.com/v2/checkout/orders'; // Use sandbox URL

        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: finalTotal,
                    },
                    // Pass cart and user details for webhook fulfillment.
                    // This is the key to making the process stateless.
                    custom_id: JSON.stringify(customIdPayload),
                },
            ],
            application_context: {
                brand_name: 'Cuddleia',
                return_url: `${req.nextUrl.origin}/checkout/success`,
                cancel_url: `${req.nextUrl.origin}/checkout`,
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload),
        });
        
        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to create PayPal order:', data);
            throw new Error(data.message || `PayPal API responded with status ${response.status}.`);
        }
        
        return NextResponse.json({ orderID: data.id });

    } catch (error: any) {
        console.error('Create PayPal Order Error:', error);
        return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}

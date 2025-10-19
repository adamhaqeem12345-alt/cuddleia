
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
        const { cart } = (await req.json()) as { cart: CartItem[] };

        if (!cart || cart.length === 0) {
            return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
        }

        const totalAmountUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

        if (parseFloat(totalAmountUSD) <= 0) {
            return NextResponse.json({ error: 'Total amount must be positive.' }, { status: 400 });
        }

        const accessToken = await getPayPalAccessToken();
        const url = 'https://api-m.sandbox.paypal.com/v2/checkout/orders'; // Use sandbox URL

        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: totalAmountUSD,
                    },
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

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Failed to create PayPal order:', errorBody);
            throw new Error(`PayPal API responded with status ${response.status}.`);
        }
        
        const data = await response.json();
        
        return NextResponse.json({ orderID: data.id });

    } catch (error: any) {
        console.error('Create PayPal Order Error:', error);
        return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}

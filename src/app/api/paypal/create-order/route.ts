import { NextResponse } from 'next/server';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_ENV } = process.env;

const getPayPalAccessToken = async () => {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const url = PAYPAL_API_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token' : 'https://api-m.paypal.com/v1/oauth2/token';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get PayPal access token: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.access_token;
};

export async function POST(request: Request) {
  try {
    const { cart } = await request.json();
    
    if (!cart || cart.length === 0) {
        return new NextResponse(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const url = PAYPAL_API_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com/v2/checkout/orders' : 'https://api-m.paypal.com/v2/checkout/orders';

    const totalAmount = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0).toFixed(2);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: totalAmount,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: totalAmount
                        }
                    }
                },
                 items: cart.map((item: any) => ({
                    name: item.name,
                    unit_amount: {
                        currency_code: 'USD',
                        value: item.price.toFixed(2),
                    },
                    quantity: item.quantity.toString(),
                }))
            }]
        })
    });

    const data = await response.json();
    
    if (response.ok) {
        return NextResponse.json({ orderID: data.id });
    } else {
        return new NextResponse(JSON.stringify(data || { error: 'Failed to create order' }), { status: response.status });
    }
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
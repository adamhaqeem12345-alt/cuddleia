import { NextResponse } from 'next/server';

// This function gets a PayPal access token. It is self-contained.
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

export async function POST(request) {
  console.log("API ROUTE: /api/paypal/create-order");
  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    
    // We must re-fetch product details on the server to ensure price integrity
    const allProducts = (await import('@/lib/products')).products;

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
      return NextResponse.json({ error: 'Invalid total amount for order.' }, { status: 400 });
    }

    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    const accessToken = await getAccessToken();
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
        return NextResponse.json({ error: `Failed to create PayPal order: ${errorDetails}` }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json(order);

  } catch (error) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
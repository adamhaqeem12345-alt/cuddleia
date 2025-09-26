
import { NextResponse } from 'next/server';
import { products as allProducts } from '@/lib/products';
import type { Product } from '@/lib/types';

// This is a self-contained helper function to get a PayPal access token.
async function getAccessToken() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;

    // Defensive check for environment variables
    if (!CLIENT_ID || !CLIENT_SECRET || !PAYPAL_API_URL) {
        throw new Error("Missing PayPal credentials in environment variables.");
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
        const errorDetails = await response.text();
        throw new Error(`Failed to get PayPal access token: ${errorDetails}`);
    }
    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/create-order");

  // Environment Variable Check
  if (!process.env.PAYPAL_API_URL || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("Configuration error: PayPal environment variables are not fully set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  try {
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    
    let total = 0;
    const items = cart.map((cartItem: { id: string, quantity: number }) => {
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
    
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;

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

    const order = await response.json();
    return NextResponse.json(order);

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

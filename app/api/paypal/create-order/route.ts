
// Secrets are in .env.local — do not hardcode here.
import { NextResponse } from 'next/server';
import { z } from 'zod';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const createOrderSchema = z.object({
  total: z.string(),
});


// Function to get PayPal access token
async function getAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('MISSING_API_CREDENTIALS');
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

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[PayPal Auth] Failed to get access token. Status: ${response.status}. Body: ${errorBody}`);
    throw new Error('Failed to authenticate with PayPal.');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { total } = validation.data;
    const accessToken = await getAccessToken();
    const url = `${PAYPAL_API_URL}/v2/checkout/orders`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        // It's a good practice to use a new ID for each API call for idempotency.
        'PayPal-Request-Id': `cuddleia-order-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total,
            },
          },
        ],
        application_context: {
            brand_name: 'Cuddleia',
            return_url: 'https://www.cuddleia.com/checkout/success',
            cancel_url: 'https://www.cuddleia.com/checkout',
        }
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
        return NextResponse.json(data);
    } else {
        console.error('PayPal create order failed:', data);
        return NextResponse.json({ error: data.message || 'Failed to create order.' }, { status: response.status });
    }

  } catch (error: any) {
    console.error('Internal server error creating order:', error);
    if (error.message === 'MISSING_API_CREDENTIALS') {
        return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

'use server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const base = 'https://api-m.sandbox.paypal.com';

/**
 * Fetches an access token from the PayPal API.
 * The token is required for all subsequent API requests.
 */
async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('MISSING_API_CREDENTIALS');
  }
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

/**
 * Creates an order with the PayPal API.
 * @param total - The total amount for the order.
 * @returns The created order details, including the approval link.
 */
export async function createPayPalOrder(total: number) {
  const accessToken = await getPayPalAccessToken();
  const url = `${base}/v2/checkout/orders`;

  // Ensure the total is a string with two decimal places
  const formattedTotal = total.toFixed(2);

  // Define the URLs for success and cancellation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl = `${appUrl}/checkout?paypal_success=true`;
  const cancelUrl = `${appUrl}/checkout?paypal_cancel=true`;

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: formattedTotal,
        },
      },
    ],
    application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'Cuddleia',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
    },
  };

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('PayPal API Error:', data);
    const errorMessage = data.details?.[0]?.description || data.message || 'Failed to create order.';
    throw new Error(errorMessage);
  }

  return data;
}

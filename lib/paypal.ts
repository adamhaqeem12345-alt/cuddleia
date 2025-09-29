// lib/paypal.ts

/**
 * Fetches an access token from the PayPal API.
 * @returns {Promise<string>} The access token.
 */
async function getAccessToken(): Promise<string> {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const base = process.env.NODE_ENV === 'production' 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Failed to get PayPal access token:", errorDetails);
        throw new Error("Failed to authenticate with PayPal.");
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Creates a PayPal order and returns the approval link.
 * @param {number} totalValue The total amount of the order.
 * @param {string} currency The currency code.
 * @returns {Promise<{orderID: string, approveLink: string}>} The order ID and the approval link.
 */
export async function createOrder(totalValue: number, currency: string): Promise<{orderID: string, approveLink: string}> {
    const accessToken = await getAccessToken();
    const base = process.env.NODE_ENV === 'production' 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";
    const url = `${base}/v2/checkout/orders`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: currency,
                    value: totalValue.toFixed(2),
                },
            },
        ],
        application_context: {
            return_url: `${appUrl}/checkout/success`,
            cancel_url: `${appUrl}/checkout`,
            shipping_preference: 'NO_SHIPPING',
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        console.error("PayPal API Error on Order Creation:", JSON.stringify(errorDetails, null, 2));
        throw new Error(`Failed to create PayPal order. Status: ${response.status}`);
    }

    const data = await response.json();
    const approveLink = data.links.find((link: any) => link.rel === 'approve');

    if (!approveLink) {
        throw new Error("Could not find PayPal approval link.");
    }

    return { orderID: data.id, approveLink: approveLink.href };
}


/**
 * Captures a payment for a PayPal order.
 * @param {string} orderID The ID of the order to capture.
 * @returns {Promise<object>} The capture result.
 */
export async function captureOrder(orderID: string): Promise<any> {
  const accessToken = await getAccessToken();
  const base = process.env.NODE_ENV === 'production' 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
      const errorDetails = await response.json();
      console.error("PayPal API Error on Capture:", JSON.stringify(errorDetails, null, 2));
      throw new Error(`Failed to capture PayPal order. Status: ${response.status}`);
  }

  return response.json();
}

// lib/paypal.ts

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const base = "https://api-m.sandbox.paypal.com"; // Use https://api-m.paypal.com for production

/**
 * Fetches an access token from the PayPal API.
 * @returns {Promise<string>} The access token.
 */
async function getAccessToken(): Promise<string> {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("MISSING_API_CREDENTIALS");
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
}

/**
 * Captures a payment for a PayPal order.
 * @param {string} orderID The ID of the order to capture.
 * @returns {Promise<object>} The capture result.
 */
export async function captureOrder(orderID: string): Promise<any> {
  const accessToken = await getAccessToken();
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

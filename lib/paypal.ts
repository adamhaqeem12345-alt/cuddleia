
// lib/paypal.ts

/**
 * Fetches an access token from the PayPal API.
 * This function is designed to be called only on the server side.
 * @returns {Promise<string>} The access token.
 */
async function getAccessToken(): Promise<string> {
    // These variables are read at runtime on the server.
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error("CRITICAL: Missing PayPal credentials in server environment variables.");
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
 * Creates a new PayPal order on the server.
 * @param {number} subtotal The total amount for the order.
 * @returns {Promise<object>} The created order details.
 */
export async function createOrder(subtotal: number): Promise<any> {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("PayPal credentials are not configured on the server.");
    }
    
    const accessToken = await getAccessToken();
    const base = process.env.NODE_ENV === 'production' 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";
    const url = `${base}/v2/checkout/orders`;

    const purchaseAmount = subtotal.toFixed(2);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: purchaseAmount,
                },
            }],
            application_context: {
                shipping_preference: 'NO_SHIPPING',
            },
        }),
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        console.error("PayPal API Error on Order Creation:", JSON.stringify(errorDetails, null, 2));
        throw new Error(`Failed to create PayPal order. Status: ${response.status}`);
    }

    return response.json();
}


/**
 * Captures a payment for a PayPal order.
 * @param {string} orderID The ID of the order to capture.
 * @returns {Promise<object>} The capture result.
 */
export async function captureOrder(orderID: string): Promise<any> {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("PayPal credentials are not configured on the server.");
    }

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
    

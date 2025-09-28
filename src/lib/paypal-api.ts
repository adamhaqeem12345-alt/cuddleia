
'use server';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

/**
 * Fetches a PayPal access token.
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error("FATAL: PayPal client ID or secret is not configured in environment variables.");
    throw new Error("Server is not configured for PayPal payments.");
  }
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Could not fetch PayPal access token. Details: ${JSON.stringify(errorData, null, 2)}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error: any) {
    console.error("Error fetching PayPal access token:", error.message);
    throw new Error(`Could not fetch PayPal access token. Details: ${error.message}`);
  }
}


/**
 * Captures a payment for a previously created PayPal order.
 * @param orderId The ID of the PayPal order.
 */
export async function captureOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "PayPal-Request-Id": `cuddleia-capture-${Date.now()}`
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Could not capture PayPal order. Details: ${JSON.stringify(data, null, 2)}`);
    }
    
    return data;
  } catch (error: any) {
    console.error(`Error capturing PayPal order ${orderId}:`, error.message);
    throw new Error(`Could not capture PayPal order. Details: ${error.message}`);
  }
}

/**
 * Verifies a webhook signature from PayPal.
 * @param headers The headers from the incoming webhook request.
 * @param body The raw body of the incoming webhook request.
 */
export async function verifyWebhook(headers: Headers, body: any): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID is not set. Cannot verify webhook.");
    return false;
  }
  
  const accessToken = await getPayPalAccessToken();

  try {
    const verificationPayload = {
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: body,
    };
    
    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationPayload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error verifying PayPal webhook:", JSON.stringify(errorData, null, 2));
        return false;
    }

    const data = await response.json();
    const verificationStatus = data.verification_status;
    return verificationStatus === 'SUCCESS';
  } catch (error: any) {
    console.error("Error verifying PayPal webhook:", error.message);
    return false;
  }
}

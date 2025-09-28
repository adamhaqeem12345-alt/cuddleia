
'use server';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;
const PAYPAL_API = PAYPAL_API_URL || 'https://api-m.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn("PayPal environment variables (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not fully set. PayPal functionality will be disabled.");
}

/**
 * Fetches a PayPal access token.
 * This function is exported so it can be used by any server-side module.
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal environment variables are not configured.");
  }
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Failed to get PayPal access token response:", errorBody);
      throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching PayPal access token:", error);
    throw error;
  }
}


/**
 * Captures a payment for a previously created PayPal order.
 * @param orderId The ID of the PayPal order.
 */
export async function captureOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const jsonResponse = await response.json();
    if (!response.ok) {
       console.error(`PayPal capture order failed with status ${response.status}:`, jsonResponse);
       const errorMessage = jsonResponse?.details?.[0]?.description || jsonResponse.message || "Failed to capture PayPal order."
       throw new Error(errorMessage);
    }

    return jsonResponse;
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    throw new Error("Could not capture PayPal order.");
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
    
    const response = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationPayload),
    });

    if (!response.ok) {
        console.error("Webhook verification request failed:", response.status, await response.text());
        return false;
    }
    
    const verificationStatus = await response.json();
    return verificationStatus.verification_status === 'SUCCESS';
  } catch (error) {
    console.error("Error verifying PayPal webhook:", error);
    return false;
  }
}

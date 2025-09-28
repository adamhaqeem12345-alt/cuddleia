
'use server';

import axios from 'axios';
import type { CartItem } from './types';

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
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error fetching PayPal access token:", errorMessage);
    throw new Error(`Could not fetch PayPal access token. Details: ${errorMessage}`);
  }
}

/**
 * Creates a PayPal order for the given cart items, strictly adhering to v2 schema.
 * @param cartItems The items in the user's shopping cart.
 */
export async function createOrder(cartItems: CartItem[]): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  // 1. Validate and sanitize items before they are used
  const validItems = cartItems.filter(item => 
    item &&
    typeof item.name === 'string' && item.name.trim() !== '' &&
    typeof item.price === 'number' && item.price >= 0 && // Allow 0 for now, total check will handle it
    typeof item.quantity === 'number' && item.quantity >= 1
  );

  if (validItems.length !== cartItems.length) {
      console.warn("Some items were filtered from the cart due to invalid data.", { originalCount: cartItems.length, validCount: validItems.length });
  }

  if (validItems.length === 0) {
      throw new Error("Cart is empty or contains only invalid items.");
  }

  // 2. Calculate total value from validated items
  const totalValueInCents = validItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalValueInDollars = (totalValueInCents / 100).toFixed(2); // String with 2 decimal places

  // 3. Check for zero-value total
  if (parseFloat(totalValueInDollars) <= 0) {
      throw new Error("Cannot create an order with a total value of zero.");
  }

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalValueInDollars, // Correctly formatted string
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: totalValueInDollars // Correctly formatted string
            }
          }
        },
        items: validItems.map((item) => ({
            name: item.name.substring(0, 127),
            unit_amount: {
                currency_code: "USD",
                value: (item.price / 100).toFixed(2), // Correctly formatted string
            },
            quantity: String(item.quantity),
            sku: item.id.substring(0, 127)
        }))
      }
    ],
    application_context: {
        brand_name: "Cuddleia",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
    }
  };

  try {
    console.log("Attempting to create PayPal order with payload:", JSON.stringify(payload, null, 2));
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `cuddleia-order-${Date.now()}`
        },
      }
    );
    
    console.log("Full PayPal create-order SUCCESS response:", JSON.stringify(response.data, null, 2));
    return response.data;

  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error creating PayPal order. Full error response:", errorMessage);
    // CRITICAL: Re-throw as a new Error so the message is propagated.
    throw new Error(`Could not create PayPal order. Details: ${errorMessage}`);
  }
}


/**
 * Captures a payment for a previously created PayPal order.
 * @param orderId The ID of the PayPal order.
 */
export async function captureOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      null, // No body needed for capture
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `cuddleia-capture-${Date.now()}`
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error(`Error capturing PayPal order ${orderId}:`, errorMessage);
    throw new Error(`Could not capture PayPal order. Details: ${errorMessage}`);
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
    
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const verificationStatus = response.data.verification_status;
    return verificationStatus === 'SUCCESS';
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error verifying PayPal webhook:", errorMessage);
    return false;
  }
}

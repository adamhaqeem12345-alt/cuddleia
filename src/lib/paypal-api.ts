
'use server';

import axios from 'axios';
import type { CartItem } from './types';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn("PayPal environment variables (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not fully set. PayPal functionality will be disabled.");
}

/**
 * Fetches a PayPal access token.
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal client ID or secret is not configured.");
  }
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    console.log("Requesting PayPal access token...");
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
    console.log("Successfully fetched PayPal access token.");
    return response.data.access_token;
  } catch (error: any) {
    console.error("Error fetching PayPal access token:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw new Error("Could not fetch PayPal access token.");
  }
}

/**
 * Creates a PayPal order for the given cart items.
 * @param cartItems The items in the user's shopping cart.
 */
export async function createOrder(cartItems: CartItem[]): Promise<any> {
  console.log("createOrder helper function invoked with cartItems:", cartItems);
  const accessToken = await getPayPalAccessToken();

  const totalValue = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalValueInDollars = (totalValue / 100).toFixed(2);
  
  console.log(`Calculated total value: $${totalValueInDollars}`);

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalValueInDollars,
          breakdown: {
              item_total: {
                  currency_code: "USD",
                  value: totalValueInDollars
              }
          }
        },
        items: cartItems.map((item) => ({
            name: item.name.substring(0, 127), // PayPal API has a 127 char limit for item name
            unit_amount: {
                currency_code: "USD",
                value: (item.price / 100).toFixed(2),
            },
            quantity: String(item.quantity),
            sku: item.id.substring(0, 127) // PayPal API has a 127 char limit for SKU
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
    console.log("Creating PayPal order with payload:", JSON.stringify(payload, null, 2));
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
    
    // Log the full successful response from PayPal
    console.log("Full PayPal create-order response:", JSON.stringify(response.data, null, 2));

    if (!response.data.id) {
       console.error("PayPal create-order response missing 'id':", response.data);
       throw new Error("PayPal response did not include an order ID.");
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error("Error creating PayPal order:", errorMessage);
    throw new Error(`Could not create PayPal order. Details: ${errorMessage}`);
  }
}


/**
 * Captures a payment for a previously created PayPal order.
 * @param orderId The ID of the PayPal order.
 */
export async function captureOrder(orderId: string): Promise<any> {
  console.log(`captureOrder helper function invoked for orderId: ${orderId}`);
  const accessToken = await getPayPalAccessToken();

  try {
    console.log(`Sending capture request to PayPal for order: ${orderId}`);
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "PayPal-Request-Id": `cuddleia-capture-${Date.now()}`
        },
      }
    );

    console.log("Full PayPal capture-order response:", JSON.stringify(response.data, null, 2));
    
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
  console.log("verifyWebhook helper function invoked.");
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

    console.log("Verifying PayPal webhook with payload:", JSON.stringify(verificationPayload, null, 2));
    
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
    console.log("PayPal webhook verification response status:", verificationStatus);

    return verificationStatus === 'SUCCESS';
  } catch (error: any) {
    console.error("Error verifying PayPal webhook:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    return false;
  }
}

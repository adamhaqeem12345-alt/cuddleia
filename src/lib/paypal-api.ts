'use server';

import { ProductInfo } from '@/types/index';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE_URL } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_API_BASE_URL) {
  throw new Error("PayPal environment variables are not set.");
}

// Function to get a PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get PayPal access token: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching PayPal access token:", error);
    throw error;
  }
}

/**
 * Creates a PayPal order.
 * @param {ProductInfo[]} cartItems - The items in the shopping cart.
 * @returns {Promise<any>} The created order data from PayPal.
 */
export async function createOrder(cartItems: ProductInfo[]): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/thank-you` : 'http://localhost:3000/thank-you';
  const cancelUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/cart` : 'http://localhost:3000/cart';

  // Calculate totals
  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price / 100) * item.quantity, 0);
  const shipping = 0; // Assuming digital products have no shipping
  const tax = 0; // Assuming no tax for now
  const totalValue = itemTotal + shipping + tax;

  const orderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `CUDDLEIA-ORDER-${Date.now()}`,
        description: "Cuddleia Digital Goods",
        amount: {
          currency_code: "USD",
          value: totalValue.toFixed(2),
          breakdown: {
            item_total: { currency_code: "USD", value: itemTotal.toFixed(2) },
            shipping: { currency_code: "USD", value: shipping.toFixed(2) },
            tax_total: { currency_code: "USD", value: tax.toFixed(2) },
          },
        },
        items: cartItems.map(item => ({
          name: item.name,
          unit_amount: { currency_code: "USD", value: (item.price / 100).toFixed(2) },
          quantity: item.quantity.toString(),
        })),
      },
    ],
    application_context: {
      brand_name: "Cuddleia",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  try {
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
       const errorBody = await response.text();
       throw new Error(`Failed to create PayPal order: ${response.status} ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw new Error("Could not create PayPal order.");
  }
}

/**
 * Captures a PayPal order.
 * @param {string} orderId - The ID of the order to capture.
 * @returns {Promise<any>} The captured order data.
 */
export async function captureOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

     if (!response.ok) {
       const errorBody = await response.text();
       throw new Error(`Failed to capture PayPal order: ${response.status} ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    throw new Error("Could not capture PayPal order.");
  }
}

/**
 * Verifies a PayPal webhook signature.
 * @param {Headers} headers - The request headers.
 * @param {any} body - The raw request body.
 * @returns {Promise<boolean>} - True if the signature is valid, false otherwise.
 */
export async function verifyWebhook(headers: Headers, body: any): Promise<boolean> {
  const { PAYPAL_WEBHOOK_ID } = process.env;
  if (!PAYPAL_WEBHOOK_ID) {
    console.error("PAYPAL_WEBHOOK_ID is not set.");
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
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: body,
    };
    
    const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`, {
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

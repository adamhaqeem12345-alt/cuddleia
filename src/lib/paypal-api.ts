'use server';

import type { ProductInfo } from '@/types/index';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_API) {
  throw new Error("PayPal environment variables are not fully set.");
}

/**
 * Converts a number to a string with exactly two decimal places.
 * @param n The number to format.
 */
function toTwoDecimalString(n: number) {
  return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
}

/**
 * Sanitizes a reference ID to meet PayPal's constraints.
 * @param id The reference ID string.
 */
function sanitizeReferenceId(id: string) {
  return id.replace(/[^A-Za-z0-9-_]/g, "").slice(0, 127) || "ORDER";
}

/**
 * Ensures a URL uses the HTTPS protocol.
 * @param url The URL string to check.
 */
function ensureHttps(url: string) {
  if (!url) throw new Error("Missing return/cancel url");
  // Allow localhost for local development testing, but enforce HTTPS for all other domains.
  if (!url.startsWith('http://localhost') && !/^https:///i.test(url)) {
      throw new Error("return_url and cancel_url must be https:// for live transactions");
  }
  return url;
}


async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  try {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
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
 * Builds a PayPal-compliant order payload from a cart.
 * @param cart Array of items: { id: string, name: string, price: number (in cents), quantity: number }
 * @param currency 3-letter uppercase code like "USD"
 * @param referenceId A unique reference for the purchase unit
 * @param returnUrl The URL to redirect to after payment approval
 * @param cancelUrl The URL to redirect to if the user cancels
 */
export function buildOrderPayload(
  cart: ProductInfo[],
  currency: string,
  referenceId: string,
  returnUrl: string,
  cancelUrl: string
) {
  if (!Array.isArray(cart) || cart.length === 0) throw new Error("Cart must be a non-empty array");
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Invalid currency code");

  // Map cart items to PayPal's required format
  const items = cart.map((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error("Item quantity must be a positive integer");
    const unitAmount = toTwoDecimalString(item.price / 100); // Convert from cents
    return {
      name: String(item.name).slice(0, 127),
      unit_amount: { currency_code: currency, value: unitAmount },
      quantity: String(item.quantity),
      sku: String(item.id).slice(0, 127),
    };
  });

  // Calculate totals using integer math with cents to avoid floating-point errors
  let itemTotalCents = 0;
  for (const item of cart) {
    itemTotalCents += item.price * item.quantity;
  }
  const itemTotalStr = toTwoDecimalString(itemTotalCents / 100);
  
  // For this application, shipping and tax are zero.
  const shippingCents = 0;
  const taxCents = 0;

  const totalCents = itemTotalCents + shippingCents + taxCents;
  const totalStr = toTwoDecimalString(totalCents / 100);

  // The total amount must exactly match the breakdown.
  if (totalStr !== itemTotalStr) {
      console.error("Mismatch between total and item_total. This should not happen if shipping/tax are zero.");
  }

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: sanitizeReferenceId(referenceId),
        description: "Cuddleia Digital Goods Purchase",
        amount: {
          currency_code: currency,
          value: totalStr,
          breakdown: {
            item_total: { currency_code: currency, value: itemTotalStr },
            shipping: { currency_code: currency, value: toTwoDecimalString(shippingCents / 100) },
            tax_total: { currency_code: currency, value: toTwoDecimalString(taxCents / 100) },
          },
        },
        items: items,
      },
    ],
    application_context: {
      brand_name: "Cuddleia",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: ensureHttps(returnUrl),
      cancel_url: ensureHttps(cancelUrl),
    },
  };
  return payload;
}


export async function createOrder(cartItems: ProductInfo[]): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/thank-you` : 'http://localhost:3000/thank-you';
  const cancelUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/cart` : 'http://localhost:3000/cart';
  const referenceId = `CUDDLEIA-ORDER-${Date.now()}`;
  
  const payload = buildOrderPayload(cartItems, "USD", referenceId, returnUrl, cancelUrl);
  
  try {
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const jsonResponse = await response.json();
    if (!response.ok) {
       console.error(`PayPal create order failed:`, jsonResponse);
       throw new Error(jsonResponse?.message || `Failed to create PayPal order: ${response.statusText}`);
    }

    return jsonResponse;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw new Error("Could not create PayPal order.");
  }
}

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
       console.error(`PayPal capture order failed:`, jsonResponse);
       throw new Error(jsonResponse?.message || `Failed to capture PayPal order: ${response.statusText}`);
    }

    return jsonResponse;
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    throw new Error("Could not capture PayPal order.");
  }
}

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
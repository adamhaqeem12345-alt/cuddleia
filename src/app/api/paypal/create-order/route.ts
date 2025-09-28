
import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

/**
 * Converts a number in cents to a string with exactly two decimal places.
 * e.g., 1500 -> "15.00"
 */
function toTwoDecimalString(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2);
}

/**
 * Strips invalid characters from a string for use in PayPal fields.
 * PayPal has limitations on character sets and length.
 */
function sanitizeString(str: string, maxLength: number): string {
    // Removes non-alphanumeric, non-space, and basic punctuation characters.
    // Also removes emojis by checking for a wide range of unicode characters.
    return str.replace(/[^\w\s.,-]|[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').slice(0, maxLength);
}


export async function POST(req: Request) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("Create order failed: Cart is empty or invalid.");
      return NextResponse.json({ error: "Cart is empty or invalid." }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const currency = "USD"; // Valid ISO 4217 currency code

    // Calculate totals using integer math with cents to avoid floating-point errors
    const itemTotalCents = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const itemTotalValue = toTwoDecimalString(itemTotalCents);

    // Map cart items to PayPal's required format
    const items = cartItems.map((item) => ({
        name: sanitizeString(item.name, 127),
        description: sanitizeString(item.description, 127),
        unit_amount: { 
            currency_code: currency, 
            value: toTwoDecimalString(item.price) 
        },
        quantity: String(item.quantity),
        sku: sanitizeString(item.id, 127),
    }));

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `CUDDLEIA-ORDER-${Date.now()}`,
          description: "Cuddleia Digital Product Purchase",
          amount: {
            currency_code: currency,
            value: itemTotalValue, // Total must match breakdown
            breakdown: {
              item_total: {
                currency_code: currency,
                value: itemTotalValue
              }
            }
          },
          items: items,
        }
      ],
      application_context: {
        brand_name: "Cuddleia",
        landing_page: "NO_PREFERENCE",
        shipping_preference: "NO_SHIPPING", // Essential for digital goods
        user_action: "PAY_NOW",
        return_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/thank-you` : 'http://localhost:3000/thank-you',
        cancel_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/cart` : 'http://localhost:3000/cart',
      }
    };
    
    const PAYPAL_API = process.env.PAYPAL_API || "https://api-m.paypal.com";
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
       console.error(`PayPal create order failed with status ${response.status}:`, jsonResponse);
       const errorMessage = jsonResponse?.details?.[0]?.description || jsonResponse?.message || `Failed to create PayPal order.`;
       throw new Error(errorMessage);
    }

    // Return only the valid PayPal order ID, which is what the frontend SDK needs.
    return NextResponse.json({ id: jsonResponse.id });

  } catch (err: any) {
    console.error("create-order error:", err.message);
    return NextResponse.json({ error: err.message || "Create order failed" }, { status: 500 });
  }
}

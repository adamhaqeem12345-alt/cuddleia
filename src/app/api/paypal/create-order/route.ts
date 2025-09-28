
import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

/**
 * Converts a number to a string with exactly two decimal places.
 * e.g., 1500 -> "15.00", 25 -> "0.25"
 */
function toTwoDecimalString(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2);
}

/**
 * Strips invalid characters from a string to be used in PayPal descriptions.
 */
function sanitizeString(str: string): string {
    // Removes emojis and other non-standard characters.
    return str.replace(/[^\w\s.,-]/g, '').slice(0, 127);
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

    // Map cart items to PayPal's required format
    const items = cartItems.map((item) => {
        const unitAmount = toTwoDecimalString(item.price); // Convert cents to "?.??" string
        return {
            name: sanitizeString(item.name),
            description: sanitizeString(item.description).slice(0, 127),
            unit_amount: { currency_code: currency, value: unitAmount },
            quantity: String(item.quantity), // Quantity must be a string
            sku: sanitizeString(item.id).slice(0, 127),
        };
    });

    // Calculate totals using integer math with cents to avoid floating-point errors
    const itemTotalCents = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const itemTotalValue = toTwoDecimalString(itemTotalCents);

    // The purchase_units amount must exactly match the breakdown.
    // For digital goods, shipping and tax are typically zero.
    const totalAmountValue = itemTotalValue;

    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                reference_id: `CUDDLEIA-ORDER-${Date.now()}`,
                description: "Cuddleia Digital Goods Purchase",
                amount: {
                    currency_code: currency,
                    value: totalAmountValue,
                    breakdown: {
                        item_total: { currency_code: currency, value: itemTotalValue },
                    },
                },
                items: items,
            },
        ],
        application_context: {
            brand_name: "Cuddleia",
            user_action: "PAY_NOW",
            return_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/thank-you` : 'http://localhost:3000/thank-you',
            cancel_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/cart` : 'http://localhost:3000/cart',
        },
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
       throw new Error(jsonResponse?.message || `Failed to create PayPal order.`);
    }

    // Return only the valid PayPal order ID
    return NextResponse.json({ id: jsonResponse.id });

  } catch (err: any) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: err.message || "Create order failed" }, { status: 500 });
  }
}

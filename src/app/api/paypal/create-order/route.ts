
import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const accessToken = await getPayPalAccessToken();
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
    }

    const totalValue = cartItems.reduce((acc: number, item: CartItem) => {
        return acc + (item.price * item.quantity);
    }, 0);

    const totalValueInDollars = (totalValue / 100).toFixed(2);

    const orderPayload = {
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
          items: cartItems.map((item: CartItem) => ({
              name: item.name.substring(0, 127),
              unit_amount: {
                  currency_code: "USD",
                  value: (item.price / 100).toFixed(2),
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
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/thank-you`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
      }
    };

    const response = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    
    console.log("Full PayPal create-order response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("PayPal create order failed:", data);
      const errorMessage = data?.details?.[0]?.description || data.message || "Failed to create PayPal order.";
      throw new Error(errorMessage);
    }
    
    if (!data.id) {
       console.error("PayPal create-order response missing 'id':", data);
       throw new Error("PayPal response did not include an order ID.");
    }

    return NextResponse.json({ id: data.id });

  } catch (err: any) {
    console.error("PayPal API /create-order error:", err.message);
    return NextResponse.json({ error: err.message || "An unexpected error occurred." }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';

async function getAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("PayPal credentials are not set in environment variables.");
  }

  const auth = Buffer.from(
    PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
  ).toString("base64");

  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
      const errorBody = await response.text();
      console.error("Failed to get PayPal access token:", errorBody);
      throw new Error("Failed to authenticate with PayPal.");
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const accessToken = await getAccessToken();
    const { cartItems } = await req.json(); // cartItems from the frontend

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate the total value from cart items
    const totalValue = cartItems.reduce((acc: number, item: any) => {
        // item.price is in cents, convert to dollars for calculation
        return acc + (item.price / 100) * item.quantity;
    }, 0).toFixed(2);


    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalValue
          }
        }
      ],
      application_context: {
        brand_name: "Cuddleia",
        user_action: "PAY_NOW",
        return_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/thank-you` : 'http://localhost:3000/thank-you',
        cancel_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/cart` : 'http://localhost:3000/cart',
      }
    };

    const response = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(order)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal create order failed:", data);
      throw new Error(data.message || "Failed to create PayPal order.");
    }
    
    // Return only the order ID to the frontend
    return NextResponse.json({ id: data.id });

  } catch (err: any) {
    console.error("PayPal error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}



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
    const { cartItems } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalValue = cartItems.reduce((acc: number, item: any) => {
        return acc + item.price * item.quantity;
    }, 0);

    const totalValueInDollars = (totalValue / 100).toFixed(2);


    const order = {
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
          items: cartItems.map((item: any) => ({
              name: item.name.substring(0, 127),
              unit_amount: {
                  currency_code: "USD",
                  value: (item.price / 100).toFixed(2),
              },
              quantity: String(item.quantity),
              sku: item.id.substring(0, 50)
          }))
        }
      ],
      application_context: {
        brand_name: "Cuddleia",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
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
    
    // Detailed log of PayPal's response
    console.log("Full PayPal create-order response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("PayPal create order failed:", data);
      throw new Error(data.message || "Failed to create PayPal order.");
    }
    
    if (!data.id) {
       console.error("PayPal create-order response missing 'id':", data);
       throw new Error("PayPal response did not include an order ID.");
    }

    // Return only the order ID as required by the PayPal SDK
    return NextResponse.json({ id: data.id });

  } catch (err: any) {
    console.error("PayPal API /create-order error:", err.message);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

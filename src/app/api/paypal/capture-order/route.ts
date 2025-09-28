
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
        const { orderID } = await req.json();
        if (!orderID) {
            return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
        }

        const accessToken = await getAccessToken();

        const response = await fetch(
            `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const data = await response.json();
        
        // Detailed log of the full capture response from PayPal
        console.log("Full PayPal capture-order response:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("PayPal capture failed:", data);
            return NextResponse.json({ error: "Capture failed", details: data }, { status: response.status });
        }
        
        // Return the full successful capture data to the frontend
        return NextResponse.json(data);

    } catch (err: any) {
        console.error("PayPal API /capture-order error:", err.message);
        return NextResponse.json({ error: err.message || "Capture order failed" }, { status: 500 });
    }
}

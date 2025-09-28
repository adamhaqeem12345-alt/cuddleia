
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

        if (data.status === "COMPLETED") {
            // In a real application, you would add logic here to fulfill the order,
            // such as sending a confirmation email with download links.
            // For now, we just return the successful capture data.
            return NextResponse.json(data);
        } else {
            console.error("PayPal capture failed:", data);
            return NextResponse.json({ error: "Capture failed", details: data }, { status: 400 });
        }

    } catch (err: any) {
        console.error("capture-order error:", err);
        return NextResponse.json({ error: err.message || "Capture order failed" }, { status: 500 });
    }
}

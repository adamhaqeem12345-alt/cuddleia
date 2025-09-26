
import { NextResponse } from 'next/server';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// This is a self-contained stub function to prevent build errors.
async function saveOrderAfterCapture(orderID: string, captureData: any) {
  console.log(`[STUB] Saving captured order ${orderID} to database.`);
  return Promise.resolve();
}

// This function gets a PayPal access token. It is self-contained.
async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error(`Failed to get PayPal access token: ${await response.text()}`);
    }
    const data = await response.json();
    return data.access_token;
}


export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/capture-order");
  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    });

    const capturedData = await response.json();
    if (!response.ok) {
        console.error(`Failed to capture PayPal order:`, capturedData);
        return NextResponse.json({ error: `Failed to capture PayPal order: ${capturedData?.message}` }, { status: 500 });
    }
    
    await saveOrderAfterCapture(orderID, capturedData);
    
    return NextResponse.json(capturedData);

  } catch (error: any) {
    console.error("API /capture-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 });
  }
}

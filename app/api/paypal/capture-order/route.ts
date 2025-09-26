
import { NextResponse } from 'next/server';

// This is a self-contained stub function to prevent build errors.
// In a real application, you would replace this with your database logic.
async function saveOrderAfterCapture(orderID: string, captureData: any) {
  console.log(`[STUB] Saving captured order ${orderID} to database.`);
  // Example: await db.collection('orders').doc(orderID).update({ status: 'COMPLETED', captureInfo: captureData });
  return Promise.resolve();
}

async function getAccessToken() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // Defensive check for environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Missing PayPal credentials. Ensure NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set.");
    }

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
        const errorDetails = await response.text();
        throw new Error(`Failed to get PayPal access token: ${errorDetails}`);
    }
    const data = await response.json();
    return data.access_token;
}

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/capture-order");

  // Environment Variable Check
  if (!process.env.PAYPAL_API_URL) {
    console.error("Configuration error: PAYPAL_API_URL is not set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (error: any) {
    console.error("Failed to get access token:", error);
    return NextResponse.json({ error: error.message || "Failed to authenticate with PayPal" }, { status: 500 });
  }

  try {
    const { orderID } = await request.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
    
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
        throw new Error(capturedData.message || 'Failed to capture order');
    }
    
    // Stubbed call to a database save function.
    await saveOrderAfterCapture(orderID, capturedData);
    
    return NextResponse.json(capturedData);

  } catch (error: any) {
    console.error("API /capture-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture order" }, { status: 500 });
  }
}

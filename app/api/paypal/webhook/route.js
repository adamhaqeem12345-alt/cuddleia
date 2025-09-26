
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { products as allProducts } from '@/lib/products';

// This is a self-contained helper function to get a PayPal access token.
async function getAccessToken() {
    const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;

    // Defensive check for environment variables
    if (!CLIENT_ID || !CLIENT_SECRET || !PAYPAL_API_URL) {
        throw new Error("Missing PayPal credentials in environment variables.");
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

// Fetches order details from PayPal
async function getOrderDetails(orderId) {
    const accessToken = await getAccessToken();
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
    console.log(`Fetching order details for ${orderId} from ${PAYPAL_API_URL}`);
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        console.error(`Failed to get order details for ${orderId}:`, errorDetails);
        throw new Error(`Failed to retrieve order details: ${errorDetails}`);
    }
    return response.json();
}

// Verifies a PayPal webhook signature
async function verifyWebhook(headers, rawBody) {
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
    const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!WEBHOOK_ID) {
        console.error("Configuration error: PAYPAL_WEBHOOK_ID is not set.");
        return false;
    }
    
    const accessToken = await getAccessToken();
    const body = JSON.parse(rawBody);

    const verificationBody = {
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: WEBHOOK_ID,
        webhook_event: body,
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationBody),
        cache: 'no-store',
    });
    
    if (!response.ok) {
        console.error("Webhook verification API call failed:", await response.text());
        return false;
    }

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}


export async function POST(request) {
  console.log("API ROUTE: /api/paypal/webhook received a request.");
  
  const requiredEnvVars = [
    'PAYPAL_API_URL', 'PAYPAL_WEBHOOK_ID', 'EMAIL_USER', 'EMAIL_PASS', 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'
  ];
  for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
          console.error(`Configuration error: ${varName} is not set.`);
          return NextResponse.json({ error: `Server configuration error.` }, { status: 500 });
      }
  }

  try {
    const rawBody = await request.text();
    // It's crucial to use the raw body for webhook verification
    const isVerified = await verifyWebhook(request.headers, rawBody);

    if (!isVerified) {
        console.warn('PayPal webhook verification failed. Ignoring request.');
        // Return a 403 Forbidden status for unverified webhooks.
        return NextResponse.json({ message: 'Webhook verification failed.' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);
    const eventType = body.event_type;
    console.log(`Processing verified PayPal Webhook event: ${eventType}`);

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderId = body.resource?.id;

        if (!orderId) {
             console.error(`Webhook Error: Could not find PayPal Order ID in resource.`);
             return NextResponse.json({ message: 'Could not find order ID.' }, { status: 400 });
        }
        
        const orderDetails = await getOrderDetails(orderId);
        
        if (!orderDetails) {
            console.error(`Webhook Error: Failed to retrieve details for order ${orderId}`);
            return NextResponse.json({ message: 'Failed to get order details.' }, { status: 500 });
        }
        
        const customerName = orderDetails.payer.name.given_name + ' ' + orderDetails.payer.name.surname;
        const customerEmail = orderDetails.payer.email_address;
        
        const purchaseUnit = orderDetails.purchase_units[0];
        const amount = purchaseUnit.amount;

        if (!purchaseUnit.items || purchaseUnit.items.length === 0) {
            console.warn(`Order ${orderId} has no items to process.`);
            return NextResponse.json({ received: true, message: "Order has no items." });
        }

        const productsInOrder = purchaseUnit.items.map((item) => {
            const productDetails = allProducts.find(p => p.id === item.sku);
            if (!productDetails) {
              console.warn(`Product with SKU ${item.sku} not found in local products list.`);
              return null;
            }
            return {
                name: item.name,
                quantity: parseInt(item.quantity, 10),
                price: parseFloat(item.unit_amount.value),
                downloadUrl: productDetails.downloadUrl,
            };
        }).filter((p) => p !== null && !!p.downloadUrl);

        if (productsInOrder.length > 0) {
            await sendOrderConfirmationEmail({
              customerName,
              customerEmail,
              orderId: orderId,
              total: parseFloat(amount.value),
              products: productsInOrder,
            });
        } else {
           console.warn(`No products with download links found for order ${orderId}. Email not sent.`);
        }
    }
    
    // Always return a 200 OK for webhooks you've acknowledged, even if you don't process the event type.
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    // Return 500 but log the error. PayPal will retry.
    return NextResponse.json({ error: 'Error processing webhook', details: error.message }, { status: 500 });
  }
}

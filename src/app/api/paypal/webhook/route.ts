
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

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

async function getOrderDetails(orderId: string) {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        cache: 'no-store'
    });
    if (!response.ok) {
        console.error(`Failed to get order details for ${orderId}:`, await response.text());
        return null;
    }
    return response.json();
}

async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
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
    
    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/webhook received a request.");
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    const isVerified = await verifyWebhook(request.headers, rawBody);
    if (!isVerified) {
        console.warn('PayPal webhook verification failed. Ignoring request.');
        return NextResponse.json({ message: 'Webhook verification failed.' }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`Processing verified PayPal Webhook event: ${eventType}`);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const capture = body.resource;
        const payPalOrderId = capture.supplementary_data?.related_ids?.order_id;

        if (!payPalOrderId) {
            console.error(`Webhook Error: Could not find PayPal Order ID for capture ${capture.id}`);
            return NextResponse.json({ message: 'Could not find order ID.' },{ status: 200 });
        }
        
        const orderDetails = await getOrderDetails(payPalOrderId);
        
        if (!orderDetails) {
             console.error(`Webhook Error: Could not retrieve order details for PayPal Order ID ${payPalOrderId}.`);
             return NextResponse.json({ message: 'Could not retrieve order details.' },{ status: 200 });
        }

        const customerName = orderDetails.payer.name.given_name + ' ' + orderDetails.payer.name.surname;
        const customerEmail = orderDetails.payer.email_address;
        
        const purchaseUnit = orderDetails.purchase_units[0];
        const amount = purchaseUnit.amount;

        const productsInOrder: ProductInfo[] = purchaseUnit.items.map((item: any) => {
            const productDetails = allProducts.find(p => p.id === item.sku);
            return {
                name: item.name,
                quantity: parseInt(item.quantity, 10),
                price: parseFloat(item.unit_amount.value),
                downloadUrl: productDetails?.downloadUrl || '',
            };
        }).filter((p: ProductInfo) => p.downloadUrl);

        if (productsInOrder.length > 0) {
            await sendOrderConfirmationEmail({
              customerName,
              customerEmail,
              orderId: payPalOrderId,
              total: parseFloat(amount.value),
              products: productsInOrder,
            });
        }
    }
    
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

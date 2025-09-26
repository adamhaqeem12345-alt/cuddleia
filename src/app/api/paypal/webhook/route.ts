import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: { 
            'Authorization': `Basic ${auth}`, 
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to get access token');
    }
    const data = await response.json();
    return data.access_token;
}

async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
    try {
        const accessToken = await getAccessToken();
        const verificationBody = {
            auth_algo: headers.get('paypal-auth-algo'),
            cert_url: headers.get('paypal-cert-url'),
            transmission_id: headers.get('paypal-transmission-id'),
            transmission_sig: headers.get('paypal-transmission-sig'),
            transmission_time: headers.get('paypal-transmission-time'),
            webhook_id: WEBHOOK_ID,
            webhook_event: JSON.parse(rawBody),
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

    } catch (error) {
        console.error('Error verifying PayPal webhook:', error);
        return false;
    }
}

async function getOrderDetails(orderId: string) {
    try {
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
        const orderData = await response.json();
        return { ...orderData.purchase_units[0], payer: orderData.payer };
    } catch(e) {
        console.error("Error fetching order details:", e);
        return null;
    }
}


export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    const isVerified = await verifyWebhook(request.headers, rawBody);
    if (!isVerified) {
        console.warn('PayPal webhook verification failed. Ignoring request.');
        return NextResponse.json({ error: 'Webhook verification failed' }, { status: 403 });
    }

    const eventType = body.event_type;
    console.log(`Processing verified PayPal Webhook event: ${eventType}`);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const capture = body.resource;
        const orderId = capture.id;
        const amount = capture.amount;
        const purchase_units = capture.supplementary_data?.related_ids?.order_id ? await getOrderDetails(capture.supplementary_data.related_ids.order_id) : null;
        
        if (!purchase_units) {
             console.error('Webhook Error: Could not retrieve order details from capture.');
             return NextResponse.json({ message: 'Could not retrieve order details, but webhook acknowledged.' },{ status: 200 });
        }

        const customerName = purchase_units.payer.name.given_name + ' ' + purchase_units.payer.name.surname;
        const customerEmail = purchase_units.payer.email_address;
        
        const productsInOrder: ProductInfo[] = purchase_units.items.map((item: any) => {
            const productDetails = allProducts.find(p => p.name === item.name);
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
              orderId,
              total: parseFloat(amount.value),
              products: productsInOrder,
            });
        } else {
            console.warn(`Webhook: No products with download URLs found for order ${orderId}. Email not sent.`);
        }
    }
    
    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

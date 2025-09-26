import { NextResponse } from 'next/server';
import paypal from 'paypal-rest-sdk';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

// Configure PayPal SDK
paypal.configure({
  mode: PAYPAL_API_URL.includes('sandbox') ? 'sandbox' : 'live',
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
});


export async function POST(request: Request) {
  const body = await request.json();
  const headers = request.headers;

  return new Promise((resolve) => {
    const webhookEvent = {
      headers: Object.fromEntries(headers.entries()),
      body: body,
      webhook_id: WEBHOOK_ID,
    };

    paypal.notification.webhookEvent.verify(webhookEvent, async (error, response) => {
      if (error) {
        console.error('PayPal webhook verification failed:', error);
        resolve(NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 }));
        return;
      }

      console.log('PayPal webhook verification successful. Status:', response.verification_status);
      if (response.verification_status !== 'SUCCESS') {
         resolve(NextResponse.json({ error: 'Webhook verification status not SUCCESS' }, { status: 400 }));
         return;
      }

      const eventType = body.event_type;
      console.log(`Processing PayPal Webhook event: ${eventType}`);

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const capture = body.resource;
        const orderId = capture.id;
        const amount = capture.amount;
        const purchase_units = capture.supplementary_data?.related_ids?.order_id ? await getOrderDetails(capture.supplementary_data.related_ids.order_id) : null;
        
        if (!purchase_units) {
             console.error('Webhook Error: Could not retrieve order details from capture.');
             resolve(NextResponse.json({ message: 'Could not retrieve order details' },{ status: 200 }));
             return;
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

      // Respond to PayPal with a 200 OK to acknowledge receipt of the event
      resolve(NextResponse.json({ message: 'Webhook received' },{ status: 200 }));
    });
  });
}

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
        cache: 'no-store'
    });
    const data = await response.json();
    return data.access_token;
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
        // We only need the first purchase unit as per our checkout logic
        return { ...orderData.purchase_units[0], payer: orderData.payer };
    } catch(e) {
        console.error("Error fetching order details:", e);
        return null;
    }
}

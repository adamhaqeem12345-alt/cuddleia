
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';
import { getAccessToken, getOrderDetails } from '@/lib/paypal-api';


const PAYPAL_API_URL = process.env.PAYPAL_API_URL!;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
    console.log("API ROUTE: Verifying webhook");
    try {
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

    } catch (error) {
        console.error('Error verifying PayPal webhook:', error);
        return false;
    }
}

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/webhook");
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
        
        const payPalOrderId = capture.supplementary_data?.related_ids?.order_id;

        if (!payPalOrderId) {
            console.error(`Webhook Error: Could not find PayPal Order ID for capture ${capture.id}`);
            return NextResponse.json({ message: 'Could not find order ID, but webhook acknowledged.' },{ status: 200 });
        }
        
        const orderDetails = await getOrderDetails(payPalOrderId);
        
        if (!orderDetails) {
             console.error(`Webhook Error: Could not retrieve order details for PayPal Order ID ${payPalOrderId}.`);
             return NextResponse.json({ message: 'Could not retrieve order details, but webhook acknowledged.' },{ status: 200 });
        }

        const customerName = orderDetails.payer.name.given_name + ' ' + orderDetails.payer.name.surname;
        const customerEmail = orderDetails.payer.email_address;
        
        const purchaseUnit = orderDetails.purchase_units[0];
        const amount = purchaseUnit.amount;

        const productsInOrder: ProductInfo[] = purchaseUnit.items.map((item: any) => {
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
              orderId: payPalOrderId,
              total: parseFloat(amount.value),
              products: productsInOrder,
            });
        } else {
            console.warn(`Webhook: No products with download URLs found for order ${payPalOrderId}. Email not sent.`);
        }
    }
    
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

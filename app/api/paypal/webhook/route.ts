
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';
import { verifyWebhook, getOrderDetails } from '@/lib/paypal-api';

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/webhook received a request.");
  
  // Environment Variable Check
  const requiredEnvVars = [
    'PAYPAL_API_URL', 'PAYPAL_WEBHOOK_ID', 'GMAIL_USER', 'GMAIL_APP_PASSWORD'
  ];
  for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
          console.error(`Configuration error: ${varName} is not set.`);
          // Return a 500 but log the specific missing var.
          return NextResponse.json({ error: `Server configuration error: ${varName} is not set.` }, { status: 500 });
      }
  }

  try {
    const rawBody = await request.text();
    
    const isVerified = await verifyWebhook(request.headers, rawBody);
    if (!isVerified) {
        console.warn('PayPal webhook verification failed. Ignoring request.');
        // Return 200 to prevent PayPal from retrying a failed verification.
        return NextResponse.json({ message: 'Webhook verification failed.' }, { status: 200 });
    }

    const body = JSON.parse(rawBody);
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
    // Return 200 to prevent PayPal from resending the webhook on a processing error.
    return NextResponse.json({ error: 'Error processing webhook', details: error.message }, { status: 200 });
  }
}

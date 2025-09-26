
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';
import { verifyWebhook, getOrderDetails } from '@/lib/paypal-api';

export async function POST(request: Request) {
  console.log("API ROUTE: /api/paypal/webhook received a request.");
  
  const requiredEnvVars = [
    'PAYPAL_API_URL', 'PAYPAL_WEBHOOK_ID', 'GMAIL_USER', 'GMAIL_APP_PASSWORD', 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'
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
        const purchaseUnits = body.resource?.purchase_units;

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

        const productsInOrder: ProductInfo[] = purchaseUnit.items.map((item: any) => {
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
        }).filter((p): p is ProductInfo => p !== null && !!p.downloadUrl);

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

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    // Return 500 but log the error. PayPal will retry.
    return NextResponse.json({ error: 'Error processing webhook', details: error.message }, { status: 500 });
  }
}

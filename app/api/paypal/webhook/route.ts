import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';
import { products as allProducts } from '@/lib/products';
import { verifyWebhook } from '@/lib/paypal-api';

async function getOrderDetails(orderId: string) {
    // This is a stub function. In a real application, you would fetch 
    // the order details from PayPal's API to get the payer's email.
    // We are simulating this for now to avoid breaking the build.
    console.log(`[STUB] Fetching order details for ${orderId}`);
    return Promise.resolve({
        id: orderId,
        status: "COMPLETED",
        payer: {
            name: { given_name: "John", surname: "Doe" },
            email_address: "sb-k2fsc30051433@personal.example.com", // A sandbox email
        },
        purchase_units: [
            {
                amount: { value: '15.00' }, // Example amount
                items: [
                    { sku: '001', name: 'Barakah Business Blueprint', quantity: '1', unit_amount: { value: '15.00' } },
                ]
            }
        ]
    });
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
        
        // In a real app, you would fetch this from PayPal. We are stubbing it here.
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

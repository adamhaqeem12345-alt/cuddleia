'use server';

import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { products as allProducts } from '@/lib/products';
import { type NextRequest } from 'next/server';
import { getAccessToken } from '@/lib/paypal-api';


// Verifies a PayPal webhook signature
async function verifyWebhook(headers: Headers, rawBody: string) {
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
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


// Fetches order details from PayPal
async function getOrderDetails(orderId: string) {
    const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    const accessToken = await getAccessToken();

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


export async function POST(request: NextRequest) {
  
  const requiredEnvVars = [
    'PAYPAL_API_URL', 'PAYPAL_WEBHOOK_ID', 'EMAIL_USER', 'EMAIL_PASS', 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'
  ];

  for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
          console.error(`Webhook Configuration error: ${varName} is not set.`);
          // Return 200 OK to prevent PayPal from retrying, but log the critical error.
          return NextResponse.json({ message: `Server configuration error: ${varName} is missing.` }, { status: 200 });
      }
  }

  try {
    const rawBody = await request.text();
    const isVerified = await verifyWebhook(request.headers, rawBody);

    if (!isVerified) {
        console.warn('PayPal webhook verification failed. Ignoring request.');
        return NextResponse.json({ message: 'Webhook verification failed.' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);
    const eventType = body.event_type;

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderId = body.resource?.id;

        if (!orderId) {
             console.error(`Webhook Error: Could not find PayPal Order ID in resource.`);
             return NextResponse.json({ message: 'Could not find order ID.' }, { status: 400 });
        }
        
        const orderDetails = await getOrderDetails(orderId);
        
        const customerName = orderDetails.payer.name.given_name + ' ' + orderDetails.payer.name.surname;
        const customerEmail = orderDetails.payer.email_address;
        
        const purchaseUnit = orderDetails.purchase_units[0];
        const amount = purchaseUnit.amount;

        if (!purchaseUnit.items || purchaseUnit.items.length === 0) {
            console.warn(`Order ${orderId} has no items to process.`);
            return NextResponse.json({ received: true, message: "Order has no items." });
        }

        const productsInOrder = purchaseUnit.items.map((item: any) => {
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
        }).filter((p: any): p is { name: string; quantity: number; price: number; downloadUrl: string; } => p !== null && !!p.downloadUrl);

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
    
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error.message);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}

// Secrets are in .env.local — do not hardcode here.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendProductEmail, addOrderToSheet, sendTelegramNotification } from '@/lib/server-actions';
import { Product, products } from '@/lib/products';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string().url(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  category: z.union([z.literal('Booklets'), z.literal('Wallpapers')]),
  downloadUrl: z.string().url(),
  disclaimer: z.string(),
  bundleIncludes: z.optional(z.array(z.string())),
  includedInBundle: z.optional(z.array(z.string())),
  originalPrice: z.optional(z.number()),
});

const captureOrderSchema = z.object({
  orderID: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  items: z.array(productSchema),
});


// Function to get PayPal access token
async function getAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('MISSING_API_CREDENTIALS');
    }
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = captureOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { orderID, customerName, customerEmail, items } = validation.data;
    const accessToken = await getAccessToken();
    const url = `${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    // Check if capture was successful
    if (response.ok && data.status === 'COMPLETED') {
        const totalAmount = parseFloat(data.purchase_units[0].payments.captures[0].amount.value);
        const itemsString = items.map(item => `  - ${item.name}`).join('\n');
        
        const telegramMessage = `
🎉 *New PayPal Sale!* 🎉

*Customer:* ${customerName}
*Email:* ${customerEmail}

*Items Purchased:*
${itemsString}

*Total Amount:* $${totalAmount.toFixed(2)} USD
            `;

        // We use Promise.allSettled to ensure we try all operations even if one fails.
        const [emailResult, sheetResult, telegramResult] = await Promise.allSettled([
            sendProductEmail({
                to: customerEmail,
                subject: 'Your Cuddleia Order Confirmation',
                name: customerName,
                items: items,
            }),
            addOrderToSheet({
                customerName: customerName,
                customerEmail: customerEmail,
                products: items.map(item => item.name).join(', '),
                amount: totalAmount,
            }),
            sendTelegramNotification({ message: telegramMessage }),
        ]);
        
        // You can add more detailed logging for each promise result if needed
        if (emailResult.status === 'rejected' || (emailResult.status === 'fulfilled' && !emailResult.value.success)) {
             console.error(`[PayPal Capture] CRITICAL: FAILED TO SEND EMAIL for order ${orderID}.`);
        }
        if (sheetResult.status === 'rejected' || (sheetResult.status === 'fulfilled' && !sheetResult.value.success)) {
            console.error(`[PayPal Capture] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for order ${orderID}.`);
        }

        return NextResponse.json({ success: true, order: data });
    } else {
        console.error('PayPal capture failed:', data);
        return NextResponse.json({ error: data.message || 'Failed to capture payment.' }, { status: response.status });
    }

  } catch (error: any) {
    console.error('Internal server error capturing order:', error);
     if (error.message === 'MISSING_API_CREDENTIALS') {
        return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
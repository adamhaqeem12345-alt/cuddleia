
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { products, Product } from '@/lib/products';
import { sendProductEmail, addOrderToSheet, sendTelegramNotification } from '@/lib/server-actions';

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function generateAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('MISSING_API_CREDENTIALS');
    }
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: { 'Authorization': `Basic ${auth}` },
    });
    const data = await response.json();
    return data.access_token;
}

async function captureOrder(accessToken: string, orderID: string) {
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to capture PayPal order. Status: ${response.status}. Body: ${errorBody}`);
    }
    return response.json();
}

const captureRequestSchema = z.object({
  orderID: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  purchasedItems: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
  })),
  totalAmount: z.string(),
});

async function getProductsFromIds(itemIds: string[]): Promise<Product[]> {
    return products.filter(p => itemIds.includes(p.id));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = captureRequestSchema.safeParse(body);

        if (!validation.success) {
            console.error('[PayPal Capture] Invalid request body:', validation.error.flatten());
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }
        
        const { orderID, customerName, customerEmail, purchasedItems, totalAmount } = validation.data;

        const accessToken = await generateAccessToken();
        const captureData = await captureOrder(accessToken, orderID);

        if (captureData.status !== 'COMPLETED') {
            console.error(`[PayPal Capture] Order ${orderID} not completed. Status: ${captureData.status}`);
            return NextResponse.json({ error: 'Payment could not be completed.' }, { status: 400 });
        }
        
        console.log(`[PayPal Capture] Successfully captured order ${orderID} for ${customerName}.`);

        const itemsString = purchasedItems.map(item => `  - ${item.name}`).join('\n');
        const telegramMessage = `
🎉 *New PayPal Sale!* 🎉

*Customer:* ${customerName}
*Email:* ${customerEmail}

*Items Purchased:*
${itemsString}

*Total Amount:* $${totalAmount} USD
        `;

        const purchasedProducts = await getProductsFromIds(purchasedItems.map(i => i.id));

        if(purchasedProducts.length === 0) {
            console.error(`[PayPal Capture] CRITICAL: No products found for order ${orderID} after successful payment.`);
            return NextResponse.json({ success: true, message: 'Payment captured, but product fulfillment failed internally.' });
        }

        await Promise.allSettled([
            sendProductEmail({
                to: customerEmail,
                subject: 'Your Cuddleia Order Confirmation',
                name: customerName,
                items: purchasedProducts,
            }),
            addOrderToSheet({
                customerName: customerName,
                customerEmail: customerEmail,
                products: purchasedProducts.map(item => item.name).join(', '),
                amount: parseFloat(totalAmount),
            }),
            sendTelegramNotification({ message: telegramMessage }),
        ]);

        return NextResponse.json({ success: true, message: 'Payment captured and order processed.' });

    } catch (error) {
        console.error('[PayPal Capture] Error processing capture request:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: 'Failed to process PayPal payment.', details: errorMessage }, { status: 500 });
    }
}

    
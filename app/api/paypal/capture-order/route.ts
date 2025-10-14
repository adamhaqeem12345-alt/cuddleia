
import { NextRequest, NextResponse } from 'next/server';
import { captureOrder, generateAccessToken } from '@/lib/paypal';
import { products, Product } from '@/lib/products';
import { z } from 'zod';
import { sendProductEmail, addOrderToSheet, sendTelegramNotification } from '@/lib/server-actions';

const captureRequestSchema = z.object({
  orderID: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  purchasedItems: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
  })),
  totalAmount: z.string(), // The final total amount as a string
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

        // 1. Capture the order with PayPal
        const accessToken = await generateAccessToken();
        const captureData = await captureOrder(accessToken, orderID);

        // Check if payment was successfully completed
        if (captureData.status !== 'COMPLETED') {
            console.error(`[PayPal Capture] Order ${orderID} not completed. Status: ${captureData.status}`);
            return NextResponse.json({ error: 'Payment could not be completed.' }, { status: 400 });
        }
        
        console.log(`[PayPal Capture] Successfully captured order ${orderID} for ${customerName}.`);

        // 2. Fulfill the order (send email, add to sheet, etc.)
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
            // Still return success to the client, but log this severe issue.
            return NextResponse.json({ success: true, message: 'Payment captured, but product fulfillment failed internally.' });
        }

        const [emailResult, sheetResult, telegramResult] = await Promise.allSettled([
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
        
        if (emailResult.status === 'rejected' || (emailResult.status === 'fulfilled' && !emailResult.value.success)) {
            const errorReason = emailResult.status === 'rejected' ? emailResult.reason : emailResult.value.error;
            console.error(`[PayPal Capture] CRITICAL: FAILED TO SEND EMAIL for order ${orderID}. Details:`, errorReason);
        }
        
        if (sheetResult.status === 'rejected' || (sheetResult.status === 'fulfilled' && !sheetResult.value.success)) {
            const errorReason = sheetResult.status === 'rejected' ? sheetResult.reason : sheetResult.value.error;
            console.error(`[PayPal Capture] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for order ${orderID}. Details:`, errorReason);
        }

        if (telegramResult.status === 'rejected' || (telegramResult.status === 'fulfilled' && !telegramResult.value.success)) {
             const errorReason = telegramResult.status === 'rejected' ? telegramResult.reason : telegramResult.value.error;
            console.error(`[PayPal Capture] FAILED TO SEND TELEGRAM NOTIFICATION for order ${orderID}. Details:`, errorReason);
        }

        return NextResponse.json({ success: true, message: 'Payment captured and order processed.' });

    } catch (error) {
        console.error('[PayPal Capture] Error processing capture request:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: 'Failed to process PayPal payment.', details: errorMessage }, { status: 500 });
    }
}


import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';
import { z } from 'zod';
import { addOrderToSheet } from '../../add-to-sheet/route';
import { sendProductEmail } from '../../email/route';
import { sendTelegramNotification } from '../../telegram-notify/route';


export const dynamic = 'force-dynamic';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  downloadUrl: z.string().url(),
});

const toyyibpayWebhookSchema = z.object({
    status: z.string(),
    order_id: z.string(),
    billcode: z.string(),
    billTo: z.string(),
    billEmail: z.string().email(),
    billDescription: z.string(),
    amount: z.string(),
});

async function getPurchasedItems(billDescription: string): Promise<Product[]> {
    console.log(`[Webhook] Extracting product IDs from description: "${billDescription}"`);
    
    const prefix = "Items:";
    if (!billDescription.startsWith(prefix)) {
        console.error(`[Webhook] CRITICAL: billDescription does not have the expected "Items:" prefix.`);
        return [];
    }

    const idsString = billDescription.substring(prefix.length);
    const purchasedIds = idsString.split(',');

    if (purchasedIds.length === 0 || (purchasedIds.length === 1 && !purchasedIds[0])) {
         console.warn(`[Webhook] No product IDs found in description string: "${idsString}"`);
         return [];
    }
    
    const purchasedItems = products.filter(p => purchasedIds.includes(p.id));

    console.log(`[Webhook] Found ${purchasedItems.length} purchased items for order.`);
    return purchasedItems;
}


export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    const webhookData = {
        status: data.get('status'),
        order_id: data.get('order_id'),
        billcode: data.get('billcode'),
        billTo: data.get('billTo'),
        billEmail: data.get('billEmail'),
        billDescription: data.get('billDescription'),
        amount: data.get('amount'),
    };
    
    const validation = toyyibpayWebhookSchema.safeParse(webhookData);

    if (!validation.success) {
        console.error('[ToyyibPay Webhook] Invalid webhook data:', validation.error.flatten().fieldErrors);
        return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const { status, order_id, billcode, billTo, billEmail, billDescription, amount } = validation.data;

    console.log(`[ToyyibPay Webhook] Received callback for billcode: ${billcode}, status: ${status}, order_id: ${order_id}`);

    if (status === '1' && order_id) {
        console.log(`[Webhook] Payment successful for order ${order_id}. Customer: ${billTo} <${billEmail}>. Preparing to send notifications.`);

        const purchasedItems = await getPurchasedItems(billDescription);

        if (purchasedItems.length > 0) {
            const totalAmountMYR = parseFloat(amount) / 100;
            const itemsString = purchasedItems.map(item => `  - ${item.name}`).join('\n');
            const telegramMessage = `
🎉 *New ToyyibPay Sale!* 🎉

*Customer:* ${billTo}
*Email:* ${billEmail}

*Items Purchased:*
${itemsString}

*Total Amount:* RM${totalAmountMYR.toFixed(2)}
            `;
            
            console.log(`[Webhook] Sending notifications for ${purchasedItems.length} items to ${billEmail}.`);
            
            const [emailResult, sheetResult, telegramResult] = await Promise.allSettled([
                sendProductEmail({
                    to: billEmail,
                    subject: 'Your Cuddleia Order Confirmation',
                    name: billTo,
                    items: purchasedItems,
                }),
                addOrderToSheet({
                    customerName: billTo,
                    customerEmail: billEmail,
                    products: purchasedItems.map(item => item.name).join(', '),
                    amount: totalAmountMYR,
                }),
                sendTelegramNotification({ message: telegramMessage }),
            ]);

            if (emailResult.status === 'fulfilled' && emailResult.value.success) {
                console.log(`[Webhook] Email request sent successfully for order ${order_id} to ${billEmail}.`);
            } else {
                const errorDetails = emailResult.status === 'fulfilled' ? emailResult.value.error : emailResult.reason;
                console.error(`[Webhook] CRITICAL: FAILED TO SEND EMAIL for order ${order_id}. Details: ${errorDetails}`);
            }

            if (sheetResult.status === 'fulfilled' && sheetResult.value.success) {
                console.log(`[Webhook] Successfully added order ${order_id} to Google Sheet.`);
            } else {
                const errorDetails = sheetResult.status === 'fulfilled' ? sheetResult.value.error : sheetResult.reason;
                console.error(`[Webhook] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for order ${order_id}. Details:`, errorDetails);
            }

            if (telegramResult.status === 'fulfilled' && telegramResult.value.success) {
                console.log(`[Webhook] Successfully sent Telegram notification for order ${order_id}.`);
            } else {
                const errorDetails = telegramResult.status === 'fulfilled' ? telegramResult.value.error : telegramResult.reason;
                console.error(`[Webhook] FAILED TO SEND TELEGRAM NOTIFICATION for order ${order_id}. Details: ${errorDetails}`);
            }

        } else {
             console.warn(`[Webhook] Did not send email for order ${order_id} because no purchased items could be determined from the bill description.`);
        }

    } else {
      console.log(`[Webhook] Payment status for billcode ${billcode} was not successful (status: ${status}) or order_id was missing.`);
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('[ToyyibPay Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

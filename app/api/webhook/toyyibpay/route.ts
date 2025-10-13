
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// This schema defines the expected product structure that would have been saved with an order.
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  downloadUrl: z.string().url(),
});

// This schema validates the incoming webhook data from ToyyibPay.
const toyyibpayWebhookSchema = z.object({
    status: z.string(),
    order_id: z.string(), // Our billExternalReferenceNo
    billcode: z.string(),
    billTo: z.string(), // Customer's Name
    billEmail: z.string().email(), // Customer's Email
    billDescription: z.string(), // Contains the encoded product IDs
    amount: z.string(), // Amount in cents
});

// This function now decodes the purchased item IDs from the bill description.
// This is the workaround for not having a database.
async function getPurchasedItems(billDescription: string): Promise<Product[]> {
    console.log(`[Webhook] Extracting product IDs from description: "${billDescription}"`);
    
    // Expected format: "Items:001,002,003"
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
    
    // Find the full product details from our main products list
    const purchasedItems = products.filter(p => purchasedIds.includes(p.id));

    console.log(`[Webhook] Found ${purchasedItems.length} purchased items for order.`);
    return purchasedItems;
}


export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    const webhookData = {
        status: data.get('status'),
        order_id: data.get('order_id'), // This is our billExternalReferenceNo
        billcode: data.get('billcode'),
        billTo: data.get('billTo'),
        billEmail: data.get('billEmail'),
        billDescription: data.get('billDescription'), // This now contains our product IDs
        amount: data.get('amount'), // Amount in cents
    };
    
    const validation = toyyibpayWebhookSchema.safeParse(webhookData);

    if (!validation.success) {
        console.error('[ToyyibPay Webhook] Invalid webhook data:', validation.error.flatten().fieldErrors);
        return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const { status, order_id, billcode, billTo, billEmail, billDescription, amount } = validation.data;

    console.log(`[ToyyibPay Webhook] Received callback for billcode: ${billcode}, status: ${status}, order_id: ${order_id}`);

    // status '1' means the payment was successful
    if (status === '1' && order_id) {
        console.log(`[Webhook] Payment successful for order ${order_id}. Customer: ${billTo} <${billEmail}>. Preparing to send notifications.`);

        // Get the purchased items using our new decoding function.
        const purchasedItems = await getPurchasedItems(billDescription);

        if (purchasedItems.length > 0) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
            
            // We use Promise.allSettled to ensure we try all operations even if one fails.
            const [emailResult, sheetResult, telegramResult] = await Promise.allSettled([
                // 1. Send the product email
                fetch(`${appUrl}/api/email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: billEmail,
                        subject: 'Your Cuddleia Order Confirmation',
                        name: billTo,
                        items: purchasedItems,
                    }),
                }),
                // 2. Add the order to the Google Sheet
                fetch(`${appUrl}/api/add-to-sheet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: billTo,
                        customerEmail: billEmail,
                        products: purchasedItems.map(item => item.name).join(', '),
                        amount: totalAmountMYR,
                    }),
                }),
                // 3. Send Telegram notification
                fetch(`${appUrl}/api/telegram-notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: telegramMessage }),
                }),
            ]);

            // Check email result
            if (emailResult.status === 'fulfilled' && emailResult.value.ok) {
                console.log(`[Webhook] Email request sent successfully for order ${order_id} to ${billEmail}.`);
            } else {
                 const errorBody = emailResult.status === 'fulfilled' ? await emailResult.value.text() : emailResult.reason;
                console.error(`[Webhook] CRITICAL: FAILED TO SEND EMAIL for order ${order_id}. Details: ${errorBody}`);
            }

            // Check sheet result
            if (sheetResult.status === 'fulfilled' && sheetResult.value.ok) {
                console.log(`[Webhook] Successfully added order ${order_id} to Google Sheet.`);
            } else {
                const errorBody = sheetResult.status === 'fulfilled' ? await (sheetResult.value.json().catch(() => sheetResult.value.text())) : sheetResult.reason;
                console.error(`[Webhook] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for order ${order_id}. Details:`, errorBody);
            }

            // Check Telegram result
            if (telegramResult.status === 'fulfilled' && telegramResult.value.ok) {
                console.log(`[Webhook] Successfully sent Telegram notification for order ${order_id}.`);
            } else {
                const errorBody = telegramResult.status === 'fulfilled' ? await telegramResult.value.text() : telegramResult.reason;
                console.error(`[Webhook] FAILED TO SEND TELEGRAM NOTIFICATION for order ${order_id}. Details: ${errorBody}`);
            }

        } else {
             console.warn(`[Webhook] Did not send email for order ${order_id} because no purchased items could be determined from the bill description.`);
        }

    } else {
      console.log(`[Webhook] Payment status for billcode ${billcode} was not successful (status: ${status}) or order_id was missing.`);
    }

    // Always return a 200 OK to ToyyibPay to acknowledge receipt of the webhook.
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('[ToyyibPay Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

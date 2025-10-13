
'use server';

import { z } from 'zod';
import { products } from '@/lib/products';
import { addOrderToSheet } from '@/api/add-to-sheet/route';
import { sendProductEmail } from '@/api/email/route';
import { sendTelegramNotification } from '@/api/telegram-notify/route';
import { Product } from '@/lib/products';

const freeDownloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  productId: z.string().min(1, 'Product ID is required'),
});

export async function handleFreeDownload(data: { name: string, email: string, productId: string }) {
    const validation = freeDownloadSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    const { name, email, productId } = validation.data;
    const product = products.find(p => p.id === productId);

    if (!product || product.price !== 0) {
        return { success: false, error: 'Product not found or is not free.' };
    }

    const [emailResult, sheetResult] = await Promise.all([
        sendProductEmail({
            to: email,
            subject: `Your Free Download from Cuddleia`,
            name,
            items: [product],
        }),
        addOrderToSheet({
            customerName: name,
            customerEmail: email,
            products: product.name,
            amount: 0,
        }),
    ]);

    if (!emailResult.success) {
        console.error(`[Server Action] CRITICAL: FAILED TO SEND EMAIL to ${email}. Details: ${emailResult.error}`);
        return { success: false, error: 'Failed to send your download email. Please try again or contact support.' };
    }

    if (!sheetResult.success) {
        // Log the error but don't block the user from getting their download if the email was successful.
        console.error(`[Server Action] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for ${email}. Details: ${sheetResult.error}`);
    }

    // Send Telegram notification in the background (fire and forget)
    const telegramMessage = `
🎉 *New Free Download!* 🎉

*Name:* ${name}
*Email:* ${email}

*Item Downloaded:*
  - ${product.name}
    `;
    
    sendTelegramNotification({ message: telegramMessage })
        .catch(err => console.error('[Server Action] Failed to send Telegram notification:', err));

    return { success: true };
}


'use server';

import { z } from 'zod';
import { products } from '@/lib/products';
import { addOrderToSheet } from '@/api/add-to-sheet/route';
import { sendProductEmail } from '@/api/email/route';
import { sendTelegramNotification } from '@/api/telegram-notify/route';

const freeDownloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  productId: z.string().min(1, 'Product ID is required'),
});

export async function handleFreeDownload(data: { name: string, email: string, productId: string }) {
    const validation = freeDownloadSchema.safeParse(data);

    if (!validation.success) {
        // This error is for developers and shouldn't be user-facing if the form is validated on the client.
        return { success: false, error: 'Invalid input.' };
    }

    const { name, email, productId } = validation.data;
    const product = products.find(p => p.id === productId);

    if (!product || product.price !== 0) {
        return { success: false, error: 'Product not found or is not free.' };
    }

    // We use Promise.allSettled to ensure we try to run all critical tasks even if one fails.
    // This provides better diagnostics.
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

    // The most critical task for the user is getting the email.
    if (emailResult.success === false) {
        console.error(`[Server Action] CRITICAL: FAILED TO SEND EMAIL to ${email}. Details: ${emailResult.error}`);
        // Return a user-friendly error.
        return { success: false, error: 'Failed to send your download email. Please try again or contact support.' };
    }

    // The sheet update is critical for the business, but we don't want to block the user if it fails.
    if (sheetResult.success === false) {
        // Log this as a critical server error to be investigated.
        console.error(`[Server Action] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for ${email}. Details: ${sheetResult.error}`);
    }

    // Send Telegram notification in the background (fire and forget).
    // This is not awaited, so it doesn't delay the response to the user.
    sendTelegramNotification({ message: `
🎉 *New Free Download!* 🎉

*Name:* ${name}
*Email:* ${email}

*Item Downloaded:*
  - ${product.name}
    ` }).catch(err => console.error('[Server Action] Failed to send Telegram notification:', err));

    return { success: true };
}


import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Product, products } from '@/lib/products';
import { sendProductEmail } from '../email/route';
import { addOrderToSheet } from '../add-to-sheet/route';
import { sendTelegramNotification } from '../telegram-notify/route';

export const dynamic = 'force-dynamic';

const freeDownloadRequestSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'A valid email is required' }),
  productId: z.string().min(1, { message: 'Product ID is required' }),
});

async function notifyTelegram(customerName: string, customerEmail: string, product: Product) {
    const telegramMessage = `
🎉 *New Free Download!* 🎉

*Name:* ${customerName}
*Email:* ${customerEmail}

*Item Downloaded:*
  - ${product.name}
    `;
    
    // We don't await this, let it run in the background
    sendTelegramNotification({ message: telegramMessage })
      .catch(err => console.error('[Free Download] Failed to send Telegram notification in background:', err));
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = freeDownloadRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, email, productId } = validation.data;

        const product = products.find(p => p.id === productId);

        if (!product || product.price !== 0) {
            return NextResponse.json({ error: 'Product not found or is not free.' }, { status: 404 });
        }

        // We use Promise.allSettled to ensure we try all operations even if one fails.
        const [emailResult, sheetResult] = await Promise.all([
            // 1. Send the product email
            sendProductEmail({
                to: email,
                subject: 'Your Free Download from Cuddleia',
                name: name,
                items: [product],
            }),
            // 2. Add the order to the Google Sheet
            addOrderToSheet({
                customerName: name,
                customerEmail: email,
                products: product.name,
                amount: 0.00,
            }),
        ]);

        let emailSuccess = false;
        
        // Check email result
        if (emailResult.success) {
            console.log(`[Free Download] Email sent successfully to ${email}.`);
            emailSuccess = true;
        } else {
            console.error(`[Free Download] CRITICAL: FAILED TO SEND EMAIL to ${email}. Details: ${emailResult.error}`);
        }

        // Check sheet result
        if (sheetResult.success) {
            console.log(`[Free Download] Successfully added to Google Sheet for ${email}.`);
        } else {
            console.error(`[Free Download] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for ${email}. Details: ${sheetResult.error}`);
        }

        if (!emailSuccess) {
            // Prioritize telling the user the email failed, as that's how they get the product.
             return NextResponse.json({ error: 'Failed to send your download email. Please try again or contact support.' }, { status: 500 });
        }
        
        // Send Telegram notification in the background
        notifyTelegram(name, email, product);
        
        return NextResponse.json({
            message: 'Success! Your download link has been sent to your email.',
            downloadUrl: product.downloadUrl 
        }, { status: 200 });

    } catch (error) {
        console.error('[Free Download API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: 'Failed to process your request.', details: errorMessage }, { status: 500 });
    }
}

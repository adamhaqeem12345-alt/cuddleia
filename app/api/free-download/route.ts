
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Product, products } from '@/lib/products';

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
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: telegramMessage }),
    }).catch(err => console.error('[Free Download] Failed to send Telegram notification in background:', err));
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = freeDownloadRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, email, productId } = validation.data;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const product = products.find(p => p.id === productId);

        if (!product || product.price !== 0) {
            return NextResponse.json({ error: 'Product not found or is not free.' }, { status: 404 });
        }

        // We use Promise.allSettled to ensure we try all operations even if one fails.
        const [emailResult, sheetResult] = await Promise.allSettled([
            // 1. Send the product email
            fetch(`${appUrl}/api/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: 'Your Free Download from Cuddleia',
                    name: name,
                    items: [product],
                }),
            }),
            // 2. Add the order to the Google Sheet
            fetch(`${appUrl}/api/add-to-sheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name,
                    customerEmail: email,
                    products: product.name,
                    amount: 0.00,
                }),
            }),
        ]);

        let emailSuccess = false;
        
        // Check email result
        if (emailResult.status === 'fulfilled' && emailResult.value.ok) {
            console.log(`[Free Download] Email sent successfully to ${email}.`);
            emailSuccess = true;
        } else {
            const errorBody = emailResult.status === 'fulfilled' ? await emailResult.value.text() : emailResult.reason;
            console.error(`[Free Download] CRITICAL: FAILED TO SEND EMAIL to ${email}. Details: ${errorBody}`);
        }

        // Check sheet result
        if (sheetResult.status === 'fulfilled' && sheetResult.value.ok) {
            console.log(`[Free Download] Successfully added to Google Sheet for ${email}.`);
        } else {
            const errorBody = sheetResult.status === 'fulfilled' ? await sheetResult.value.text() : sheetResult.reason;
            console.error(`[Free Download] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for ${email}. Details: ${errorBody}`);
        }

        if (!emailSuccess) {
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

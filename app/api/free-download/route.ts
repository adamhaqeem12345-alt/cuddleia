
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Product, products } from '@/lib/products';

export const dynamic = 'force-dynamic';

const freeDownloadRequestSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'A valid email is required' }),
  productId: z.string().min(1, { message: 'Product ID is required' }),
});

// This function simulates the various notification/logging actions
async function handlePostDownloadActions(customerName: string, customerEmail: string, product: Product) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const telegramMessage = `
🎉 *New Free Download!* 🎉

*Name:* ${customerName}
*Email:* ${customerEmail}

*Item Downloaded:*
  - ${product.name}
    `;

    // We use Promise.allSettled to ensure all tasks run, even if some fail.
    const [emailResult, sheetResult, telegramResult] = await Promise.allSettled([
        // 1. Send the product email (Critical)
        fetch(`${appUrl}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: customerEmail,
                subject: 'Your Free Download from Cuddleia',
                name: customerName,
                items: [product], // Send as an array
            }),
        }),
        // 2. Add the download to the Google Sheet
        fetch(`${appUrl}/api/add-to-sheet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: customerName,
                customerEmail: customerEmail,
                products: product.name,
                amount: 0.00, // It's a free product
            }),
        }),
        // 3. Send Telegram Notification
        fetch(`${appUrl}/api/telegram-notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: telegramMessage }),
        }),
    ]);
    
    // Optional: Log results for debugging
    if (emailResult.status === 'fulfilled' && emailResult.value.ok) {
        console.log(`[Free Download] Email sent successfully to ${customerEmail}.`);
    } else {
        console.error(`[Free Download] CRITICAL: FAILED TO SEND EMAIL to ${customerEmail}.`);
    }

    if (sheetResult.status === 'fulfilled' && sheetResult.value.ok) {
        console.log(`[Free Download] Successfully added to Google Sheet for ${customerEmail}.`);
    } else {
        console.error(`[Free Download] FAILED TO ADD TO GOOGLE SHEET for ${customerEmail}.`);
    }

    if (telegramResult.status === 'fulfilled' && telegramResult.value.ok) {
        console.log(`[Free Download] Successfully sent Telegram notification.`);
    } else {
        console.error(`[Free Download] FAILED TO SEND TELEGRAM NOTIFICATION.`);
    }
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

        // Asynchronously perform logging and notifications without waiting for them to complete
        handlePostDownloadActions(name, email, product);
        
        // Immediately respond to the user with the download URL
        return NextResponse.json({
            message: 'Success! Your download link is being sent to your email.',
            downloadUrl: product.downloadUrl 
        }, { status: 200 });

    } catch (error) {
        console.error('[Free Download API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: 'Failed to process your request.', details: errorMessage }, { status: 500 });
    }
}

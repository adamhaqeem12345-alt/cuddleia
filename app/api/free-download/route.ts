
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Product, products } from '@/lib/products';

export const dynamic = 'force-dynamic';

const freeDownloadRequestSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'A valid email is required' }),
  productId: z.string().min(1, { message: 'Product ID is required' }),
});

async function sendTelegramNotification(customerName: string, customerEmail: string, product: Product) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const telegramMessage = `
🎉 *New Free Download!* 🎉

*Name:* ${customerName}
*Email:* ${customerEmail}

*Item Downloaded:*
  - ${product.name}
    `;
    
    try {
        const res = await fetch(`${appUrl}/api/telegram-notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: telegramMessage }),
        });
        if (res.ok) {
            console.log(`[Free Download] Successfully sent Telegram notification.`);
        } else {
            console.error(`[Free Download] FAILED TO SEND TELEGRAM NOTIFICATION.`);
        }
    } catch (e) {
        console.error(`[Free Download] FAILED TO SEND TELEGRAM NOTIFICATION.`, e);
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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Perform critical actions and wait for them to complete.
        const [emailResult, sheetResult] = await Promise.all([
             // 1. Send the product email (Critical)
            fetch(`${appUrl}/api/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: 'Your Free Download from Cuddleia',
                    name: name,
                    items: [product], // Send as an array
                }),
            }),
            // 2. Add the download to the Google Sheet (Critical)
            fetch(`${appUrl}/api/add-to-sheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name,
                    customerEmail: email,
                    products: product.name,
                    amount: 0.00, // It's a free product
                }),
            }),
        ]);
        
        // Check results of critical actions
        if (!emailResult.ok) {
            console.error(`[Free Download] CRITICAL: FAILED TO SEND EMAIL to ${email}.`);
            const errorBody = await emailResult.text();
            // Even if it fails, we should still try to give the user the URL if possible, but the error is logged.
            // In a more robust system, you might stop here and return an error.
             return NextResponse.json({ error: 'Failed to send your download email. Please try again or contact support.' }, { status: 500 });
        } else {
             console.log(`[Free Download] Email sent successfully to ${email}.`);
        }

        if (!sheetResult.ok) {
            const errorBody = await sheetResult.text();
            console.error(`[Free Download] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for ${email}. Details: ${errorBody}`);
             // This is a server-side failure, but we don't want to penalize the user.
             // We log it critically but still proceed.
        } else {
             console.log(`[Free Download] Successfully added to Google Sheet for ${email}.`);
        }
        
        // Asynchronously perform non-critical notifications without waiting
        sendTelegramNotification(name, email, product);
        
        // Immediately respond to the user with the download URL
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

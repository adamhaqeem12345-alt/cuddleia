
import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/products';
import { addOrderToSheet, sendProductEmail, sendTelegramNotification } from '@/lib/server-actions';
import { v4 as uuidv4 } from 'uuid';

// This is your ToyyibPay Secret Key.
// It's crucial this is kept secret and not exposed on the client-side.
const TOYYIBPAY_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY;

export async function POST(req: NextRequest) {
    if (!TOYYIBPAY_SECRET_KEY) {
        console.error('[ToyyibPay Webhook] CRITICAL: ToyyibPay Secret Key is not set in environment variables.');
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }
    
    try {
        const formData = await req.formData();
        
        // --- Data received from ToyyibPay ---
        const billcode = formData.get('billcode') as string;
        const status_id = formData.get('status') as string; // 1 for success, 2 for pending, 3 for fail
        const order_id = formData.get('order_id') as string; // This is the UUID we sent
        const msg = formData.get('msg') as string;
        const transaction_id = formData.get('transaction_id') as string;
        
        // --- Our metadata that we passed to ToyyibPay ---
        // We get these back from the redirect, not the webhook post.
        // This webhook confirms the payment, but fulfillment data comes from our server logic.
        // For webhooks, we'd typically look up the order_id in a database.
        // Since we don't have a DB, this webhook is more for logging/confirmation.
        // The primary fulfillment happens on redirect in this architecture.
        
        console.log(`[ToyyibPay Webhook] Received status '${status_id}' for order '${order_id}'`);
        
        if (status_id === '1') {
            // Payment was successful.
            // In a real-world scenario with a database, you would:
            // 1. Verify the order_id against your database to get customer/product details.
            // 2. Check if the order has already been fulfilled to prevent duplicate processing.
            // 3. Fulfill the order (send emails, update sheets).
            // 4. Mark the order as 'fulfilled' in your database.
            
            // For now, we will just log the success. The main fulfillment is handled on the client-side redirect
            // for simplicity in this project structure.
            await sendTelegramNotification({ message: `
✅ *ToyyibPay Payment SUCCESS (Webhook)* ✅

*Order ID:* ${order_id}
*Transaction ID:* ${transaction_id}
*Bill Code:* ${billcode}
*Message:* ${msg}
            `});
        } else {
             await sendTelegramNotification({ message: `
⚠️ *ToyyibPay Payment Status (Webhook)* ⚠️

*Status:* ${status_id === '3' ? 'FAILED' : 'PENDING'}
*Order ID:* ${order_id}
*Message:* ${msg}
            `});
        }

        // Respond to ToyyibPay that we have received the notification.
        // An OK response is required, otherwise ToyyibPay will keep trying to send the webhook.
        return NextResponse.json({ message: 'Webhook received' }, { status: 200 });

    } catch (error) {
        console.error('[ToyyibPay Webhook] Error processing webhook:', error);
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
}

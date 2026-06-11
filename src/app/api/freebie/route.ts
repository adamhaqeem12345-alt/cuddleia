
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById } from '@/lib/product-service';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, productId } = await req.json();

    if (!name || !email || !productId) {
      return NextResponse.json({ error: 'Name, email, and product ID are required.' }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product || product.price !== 0) {
      return NextResponse.json({ error: 'Invalid or non-free product selected.' }, { status: 400 });
    }

    const order: Order = {
        id: `FREE-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        items: [{ product: product, quantity: 1 }],
        total: "Free",
    };

    // Primary Action: Send Fulfillment Email
    const emailSuccess = await sendOrderConfirmationEmail(order);
    
    // Secondary Actions (Logging/Notification) 
    // We initiate these but don't strictly await them if they might delay the user response unnecessarily.
    // However, we want them to finish, so we'll wrap them in a separate block.
    (async () => {
        try {
            const telegramMessage = `
🎁 *Freebie Download!* 🎁

Someone just grabbed a freebie! Alhamdulillah! ✨

*Product:* ${product.name}
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone || 'Not provided'}
            `;
            await sendTelegramNotification(telegramMessage);

            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
                const timestamp = new Date().toISOString();
                const values = [[timestamp, name, email, phone || '', product.name, '0']];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
        } catch (secondaryError: any) {
            console.error("Secondary action (Telegram/Sheets) for freebie failed:", secondaryError.message);
        }
    })();

    if (!emailSuccess) {
        // If the email failed to send, we tell the user but we don't block the "success" feeling entirely
        // since we might have other ways to reach them or they might try again.
        return NextResponse.json({ 
            success: false, 
            message: 'Alhamdulillah, we received your request, but our email server had a small hiccup. Please contact us if you do not receive your link shortly.' 
        }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Freebie request processed successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    
    try {
        const criticalErrorMessage = `
🚨 *CRITICAL ERROR: Freebie API Failed* 🚨

The /api/freebie endpoint failed completely.

*Reason:* ${error.message || 'An unknown error occurred.'}
        `;
        sendTelegramNotification(criticalErrorMessage);
    } catch (notificationError) {
        console.error("Failed to send critical error notification:", notificationError);
    }
    
    return NextResponse.json({ error: error.message || 'Failed to process your request.' }, { status: 500 });
  }
}

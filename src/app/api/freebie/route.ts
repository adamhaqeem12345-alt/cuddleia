
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
    await sendOrderConfirmationEmail(order);
    
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

    return NextResponse.json({ success: true, message: 'Freebie request processed successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    
    // We can try to send a critical error notification, but don't let it block the response.
    try {
        const criticalErrorMessage = `
🚨 *CRITICAL ERROR: Freebie API Failed* 🚨

The /api/freebie endpoint failed to process a request. The user did NOT receive their download link.

*Reason:* ${error.message || 'An unknown error occurred.'}

Please investigate the server logs immediately.
        `;
        sendTelegramNotification(criticalErrorMessage);
    } catch (notificationError) {
        console.error("Failed to send critical error notification:", notificationError);
    }
    
    return NextResponse.json({ error: error.message || 'Failed to process your request.' }, { status: 500 });
  }
}

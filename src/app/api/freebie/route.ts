
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

    /**
     * Parallel Processing Strategy:
     * We trigger the email fulfillment and other secondary tasks in the background.
     * This prevents the "Success" page from hanging if SMTP or other APIs are slow.
     */
    (async () => {
        try {
            // Initiate Email Delivery
            await sendOrderConfirmationEmail(order);

            // Notify via Telegram
            const telegramMessage = `
🎁 *Freebie Download!* 🎁
*Product:* ${product.name}
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone || 'Not provided'}
            `;
            await sendTelegramNotification(telegramMessage);

            // Log to Google Sheets
            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
                const timestamp = new Date().toISOString();
                const values = [[timestamp, name, email, phone || '', product.name, '0']];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
        } catch (error: any) {
            console.error("[Freebie API] Background task failure:", error.message);
        }
    })();

    // Respond to the user immediately
    return NextResponse.json({ 
        success: true, 
        message: 'Alhamdulillah, your guide is being prepared and will arrive in your inbox shortly!' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    return NextResponse.json({ error: error.message || 'Failed to process your request.' }, { status: 500 });
  }
}

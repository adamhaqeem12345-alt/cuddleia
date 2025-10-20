
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';

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

    // This is the primary action. If this fails, the whole request should fail.
    const order: Order = {
        id: `FREE-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        items: [{ product: product, quantity: 1 }],
        total: "Free",
    };
    await sendOrderConfirmationEmail(order);
    
    // Secondary actions (logging/notification). Failure here should not fail the request for the user.
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
    } catch (teleError: any) {
        console.error("Telegram notification for freebie failed:", teleError.message);
        // Do not re-throw; we don't want this to cause a 500 error for the user.
    }

    return NextResponse.json({ success: true, message: 'Freebie request processed successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    
    // Send a critical error notification if the primary action fails
    const criticalErrorMessage = `
🚨 *CRITICAL ERROR: Freebie API Failed* 🚨

The /api/freebie endpoint failed to process a request. The user did NOT receive their download link.

*Reason:* ${error.message || 'An unknown error occurred.'}

Please investigate the server logs immediately.
    `;
    await sendTelegramNotification(criticalErrorMessage);
    
    return NextResponse.json({ error: error.message || 'Failed to process your request.' }, { status: 500 });
  }
}

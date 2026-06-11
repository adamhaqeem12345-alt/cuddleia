
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
     * PRIMARY ACTION: Email Fulfillment
     * This is awaited so the UI can report actual SMTP errors via our new tracker.
     */
    await sendOrderConfirmationEmail(order);
    
    /**
     * SECONDARY ACTIONS: Backgrounded to avoid blocking the user
     */
    const telegramMessage = `🎁 *Freebie!* 🎁\n*Product:* ${product.name}\n*Name:* ${name}\n*Email:* ${email}`;
    sendTelegramNotification(telegramMessage).catch(console.error);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (spreadsheetId) {
        const values = [[new Date().toISOString(), name, email, phone || '', product.name, '0']];
        appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values).catch(console.error);
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Alhamdulillah, your guide is being prepared and will arrive in your inbox shortly!' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Freebie API Error Tracked:', error.message);
    // STRUCTURAL FIX: Return the actual error message to the client for debugging
    return NextResponse.json({ 
        error: `Fulfillment Failed: ${error.message}` 
    }, { status: 500 });
  }
}

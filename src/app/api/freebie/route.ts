
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
     * Sequential fulfillment to ensure completion in serverless environments.
     * We strictly await the email delivery first.
     */
    try {
        await sendOrderConfirmationEmail(order);
        
        // Background these as they are non-critical and use global fetch
        const telegramMessage = `🎁 *Freebie!* 🎁\n*Product:* ${product.name}\n*Name:* ${name}\n*Email:* ${email}`;
        sendTelegramNotification(telegramMessage).catch(console.error);

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        if (spreadsheetId) {
            const values = [[new Date().toISOString(), name, email, phone || '', product.name, '0']];
            appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values).catch(console.error);
        }
    } catch (fulfillmentError: any) {
        console.error("[Freebie API] Fulfillment Error:", fulfillmentError.message);
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Alhamdulillah, your guide is being prepared and will arrive in your inbox shortly!' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request.' }, { status: 500 });
  }
}

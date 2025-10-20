
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById, Product } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, productId } = await req.json();

    if (!name || !email || !productId) {
      return NextResponse.json({ error: 'Name, email, and productId are required.' }, { status: 400 });
    }

    const product = getProductById(productId);

    if (!product || product.price !== 0) {
        return NextResponse.json({ error: 'Product not found or is not free.' }, { status: 404 });
    }

    const order: Order = {
        id: `FREE-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        items: [{ product, quantity: 1 }],
        total: 'Free',
    };
    
    // Primary action: Send the email
    await sendOrderConfirmationEmail(order);
    
    // Secondary actions (don't block response if they fail)
    // Send Telegram notification for the freebie download
    sendTelegramNotification(`
🎉 *New Free Download!* 🎉

Someone just grabbed a freebie! Here are the details:

*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone || 'N/A'}

*Item Downloaded:*
- ${product.name}

Another heart touched by Cuddleia! 💖
    `).catch(err => console.error("Failed to send Telegram notification for freebie:", err));
    
    // Log to Google Sheet
    try {
        const sheetData = [
            new Date().toISOString(),
            name,
            email,
            phone || '',
            product.name,
            '0.00'
        ];
        await appendToSheet('Cuddleia Sales Log', sheetData);
    } catch (sheetError: any) {
        console.error("Failed to log freebie download to sheet:", sheetError);
        // Send a Telegram notification about the logging failure
        await sendTelegramNotification(`
🚨 *Google Sheets Logging Failed (Freebie)* 🚨

A freebie download occurred, but logging it to Google Sheets failed.

*Error:* ${sheetError.message}
*Item:* ${product.name}
*Downloaded by:* ${name} (${email})
        `);
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error); // Log the full error to the server console
    // Send a Telegram notification about the critical failure
    await sendTelegramNotification(`
🔥 *CRITICAL ERROR: /api/freebie failed* 🔥

The freebie API endpoint encountered a critical error. The user was not able to receive their download.

*Error:* ${error.message}
*Stack Trace:*
\`\`\`
${error.stack}
\`\`\`
    `);
    
    // This will now catch errors from sendOrderConfirmationEmail if credentials are missing
    return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}

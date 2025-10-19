
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
    
    // Create a mock order object to use the existing email service
    const order: Order = {
        id: `FREE-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        items: [{ product, quantity: 1 }],
        total: 'Free',
    };
    
    await sendOrderConfirmationEmail(order);

    // Send Telegram notification
    const telegramMessage = `
🎉 *New Free Download!* 🎉

Someone just grabbed a freebie! Here are the details:

*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone || 'N/A'}

*Item Downloaded:*
- ${product.name}

Another heart touched by Cuddleia! 💖
    `;
    await sendTelegramNotification(telegramMessage);

    // Append to Google Sheet
    try {
      const timestamp = new Date().toISOString();
      // Columns: Date, Customer Name, Customer Email, Phone Number, Products Purchased, Amounts (USD)
      await appendToSheet('Cuddleia Sales Log', [timestamp, name, email, phone || '', product.name, 0]);
    } catch (sheetError) {
        console.error("Failed to append freebie download to Google Sheet:", sheetError);
        // We log the error but do not fail the request
    }
    
    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}

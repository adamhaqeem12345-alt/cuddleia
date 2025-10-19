
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
    
    // Append to Google Sheet first to get any errors
    const timestamp = new Date().toISOString();
    // Columns: Date, Customer Name, Customer Email, Phone Number, Products Purchased, Amounts (USD)
    const sheetRow = [timestamp, name, email, phone || '', product.name, 0];
    console.log("Attempting to append to 'Cuddleia Sales Log' sheet for freebie:", sheetRow);
    const sheetResult = await appendToSheet('Cuddleia Sales Log', sheetRow);
    
    if (!sheetResult.success) {
      console.error("Failed to append freebie download to Google Sheet:", sheetResult.error);
      // IMPORTANT: Return the specific error to the client for debugging
      return NextResponse.json({ error: `Failed to log to sheet: ${sheetResult.error}` }, { status: 500 });
    }

    console.log("Successfully appended freebie download to 'Cuddleia Sales Log' sheet.");

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

    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}

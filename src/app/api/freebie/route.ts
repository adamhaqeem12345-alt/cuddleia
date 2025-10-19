
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
    Promise.all([
      sendTelegramNotification(`
🎉 *New Free Download!* 🎉

Someone just grabbed a freebie! Here are the details:

*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone || 'N/A'}

*Item Downloaded:*
- ${product.name}

Another heart touched by Cuddleia! 💖
      `),
      appendToSheet('Cuddleia Sales Log', [
        new Date().toISOString(),
        name,
        email,
        phone || '',
        product.name,
        '0.00'
      ])
    ]).catch(error => {
        // Log errors from secondary actions to the server console
        console.error("Error in secondary actions (Telegram or Sheets):", error);
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    // This will now catch errors from sendOrderConfirmationEmail if credentials are missing
    return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}

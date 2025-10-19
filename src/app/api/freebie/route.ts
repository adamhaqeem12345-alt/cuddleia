
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, Order } from '@/lib/email';
import { getProductById, Product } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';

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

    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/freebie:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 });
  }
}

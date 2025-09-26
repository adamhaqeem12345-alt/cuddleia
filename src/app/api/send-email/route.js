import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  console.log("API ROUTE: /api/send-email");
  try {
    const payload = await request.json();

    if (!payload.customerEmail || !payload.orderId || !payload.products) {
      return NextResponse.json({ error: 'Invalid payload for sending email.' }, { status: 400 });
    }

    await sendOrderConfirmationEmail(payload);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('API Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

'use server';

import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  // Environment Variable Check
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Configuration error: Email credentials are not set.");
      return NextResponse.json({ error: "Server configuration error for sending email." }, { status: 500 });
  }

  try {
    const payload = await request.json();

    // Add more robust validation
    if (!payload.customerEmail || !payload.orderId || !payload.products || !Array.isArray(payload.products) || payload.products.length === 0) {
      console.error('Invalid payload for sending email:', payload);
      return NextResponse.json({ error: 'Invalid payload for sending email.' }, { status: 400 });
    }

    await sendOrderConfirmationEmail(payload);
    return NextResponse.json({ message: 'Email sent successfully' });

  } catch (error: any) {
    console.error('API Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

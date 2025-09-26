
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, EmailPayload } from '@/lib/email';

export async function POST(request: Request) {
  console.log("API ROUTE: /api/send-email");
  try {
    // The request body is already expected to be the correct EmailPayload
    const payload: EmailPayload = await request.json();

    // Basic validation
    if (!payload.customerEmail || !payload.orderId || !payload.products) {
      return NextResponse.json({ error: 'Invalid payload for sending email.' }, { status: 400 });
    }

    await sendOrderConfirmationEmail(payload);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('API Error sending email:', error);
    // Avoid exposing internal details of the error to the client
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

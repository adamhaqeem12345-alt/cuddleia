
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, EmailPayload } from '@/lib/email';

export async function POST(request: Request) {
  console.log("API ROUTE: /api/send-email");
  try {
    const payload = (await request.json()) as EmailPayload;
    await sendOrderConfirmationEmail(payload);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('API Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}

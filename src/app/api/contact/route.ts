
import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    
    await sendContactFormEmail(name, email, subject, message);
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    
    await sendContactFormEmail(name, email, subject, message);
    
    const telegramMessage = `
💌 *New Message from Cuddleia!* 💌

You've received a new message from your website. Here are the details:

*From:* ${name}
*Email:* ${email}
*Subject:* ${subject}

*Message:*
${message}

Time to reply and spread some joy! ✨
    `;
    await sendTelegramNotification(telegramMessage);

    // Log to Google Sheet
    try {
      const sheetData = [
        new Date().toISOString(),
        name,
        email,
        '', // Phone number is not collected in contact form
        subject,
        '', // Amount is not applicable
      ];
      await appendToSheet('Cuddleia Sales Log', sheetData);
    } catch (sheetError) {
      console.error("Failed to log contact form to sheet:", sheetError);
    }
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}


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
    
    // Background notifications
    const telegramMessage = `💌 *New Message!* 💌\n*From:* ${name}\n*Subject:* ${subject}\n*Message:* ${message}`;
    sendTelegramNotification(telegramMessage).catch(console.error);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (spreadsheetId) {
        const values = [[new Date().toISOString(), name, email, '', `Contact: ${subject}`, 'N/A']];
        appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values).catch(console.error);
    }
    
    return NextResponse.json({ success: true, message: 'Message sent!' }, { status: 200 });

  } catch (error: any) {
    console.error('Contact API Error:', error.message);
    return NextResponse.json({ error: `Message Delivery Failed: ${error.message}` }, { status: 500 });
  }
}

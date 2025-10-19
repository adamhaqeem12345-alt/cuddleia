
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
    
    // Send notification emails and messages
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

    // Append to Google Sheet
    const timestamp = new Date().toISOString();
    const sheetRow = [timestamp, name, email, subject, message];
    console.log("Attempting to append to 'Contact Form Submissions' sheet:", sheetRow);
    const sheetResult = await appendToSheet('Contact Form Submissions', sheetRow);
    
    if (!sheetResult.success) {
      console.error("Failed to append to Google Sheet in /api/contact:", sheetResult.error);
      // Still return success to the user, but include the sheet error for debugging
      return NextResponse.json({ 
        success: true, 
        message: 'Message sent, but failed to log to sheet.',
        sheetError: sheetResult.error 
      }, { status: 200 });
    }
    
    console.log("Successfully appended to 'Contact Form Submissions' sheet.");
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}

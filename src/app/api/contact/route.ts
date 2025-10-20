
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
    
    // Primary action
    await sendContactFormEmail(name, email, subject, message);
    
    // Secondary actions (logging/notification). Failure here should not fail the request for the user.
    try {
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

        const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
        if (spreadsheetId) {
            const timestamp = new Date().toISOString();
            // Columns: Date, Customer Name, Customer Email, Phone Number, Products Purchased, Amounts (USD)
            const values = [[timestamp, name, email, '', `Contact: ${subject}`, 'N/A']];
            await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
        }
    } catch (secondaryError: any) {
        console.error("Secondary action (Telegram/Sheets) for contact form failed:", secondaryError.message);
        // Do not re-throw; we don't want this to cause a 500 error for the user.
    }
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}


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
    
    // Primary actions
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

    // Secondary action: Log to Google Sheets
    try {
        const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
        if (spreadsheetId) {
            const timestamp = new Date().toISOString();
            // Columns: Date, Customer Name, Customer Email, Phone Number, Products Purchased, Amounts (USD)
            const values = [[timestamp, name, email, '', `Contact: ${subject}`, 'N/A']];
            await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
        }
    } catch (sheetError: any) {
        console.error("Google Sheets logging for contact form failed:", sheetError.message);
        // Do not re-throw; we don't want this to cause a 500 error for the user.
    }
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}

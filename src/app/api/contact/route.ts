
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
    
    /**
     * Parallel Processing Strategy:
     * Backgrounding the email and notification tasks to eliminate UI "hang."
     */
    (async () => {
        try {
            await sendContactFormEmail(name, email, subject, message);
            
            const telegramMessage = `
💌 *New Message from Cuddleia!* 💌
*From:* ${name}
*Email:* ${email}
*Subject:* ${subject}
*Message:*
${message}
            `;
            await sendTelegramNotification(telegramMessage);

            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
                const timestamp = new Date().toISOString();
                const values = [[timestamp, name, email, '', `Contact: ${subject}`, 'N/A']];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
        } catch (error: any) {
            console.error("[Contact API] Background task failure:", error.message);
        }
    })();
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}

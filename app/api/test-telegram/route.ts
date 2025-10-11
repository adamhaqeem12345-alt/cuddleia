
import { NextRequest, NextResponse } from 'next/server';

// This tells Next.js to always run this function dynamically on the server.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Check for environment variables
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('CRITICAL: Missing Telegram Bot Token or Chat ID for testing.');
    return NextResponse.json({ error: 'Telegram integration is not configured on the server.' }, { status: 500 });
  }

  // 2. Send the message
  try {
    const testMessage = `
🤖 *Telegram Bot Test* 🤖

This is a test message from your Cuddleia website. If you received this, your notification bot is working correctly! ✨
    `;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send test Telegram message:', errorData);
        return NextResponse.json({ error: 'Failed to send test message.', details: errorData }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully sent test Telegram message!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending test Telegram notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to send notification', details: errorMessage }, { status: 500 });
  }
}

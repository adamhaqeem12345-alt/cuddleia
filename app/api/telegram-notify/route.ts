
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const telegramRequestSchema = z.object({
  message: z.string(),
});

export async function POST(req: NextRequest) {
  // 1. Validate Input
  let validatedData;
  try {
    const body = await req.json();
    const validation = telegramRequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('[Telegram Notify] Invalid input:', validation.error.flatten().fieldErrors);
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    validatedData = validation.data;
  } catch (e) {
    console.error('[Telegram Notify] Invalid JSON body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. Check for environment variables
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[Telegram Notify] CRITICAL: Missing Telegram Bot Token or Chat ID in environment variables.');
    // We return 200 OK so we don't block the main purchase flow, but we log the critical error.
    return NextResponse.json({ message: 'Telegram integration not configured, but proceeding.' }, { status: 200 });
  }

  // 3. Send the message
  try {
    const { message } = validatedData;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown', // Allows for bold, italics etc.
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('[Telegram Notify] Failed to send Telegram message. API Response:', errorData);
        // Still return 200 so we don't break the main purchase flow for a failed notification.
        return NextResponse.json({ error: 'Failed to send Telegram message', details: errorData }, { status: 200 });
    }
    
    console.log('[Telegram Notify] Successfully sent Telegram message.');
    return NextResponse.json({ message: 'Successfully sent Telegram message' }, { status: 200 });

  } catch (error) {
    console.error('[Telegram Notify] Error sending Telegram notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Still return 200 so we don't break the main purchase flow for a failed notification.
    return NextResponse.json({ error: 'Failed to send notification', details: errorMessage }, { status: 200 });
  }
}

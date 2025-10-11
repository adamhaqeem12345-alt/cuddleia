
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    validatedData = validation.data;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. Check for environment variables
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('CRITICAL: Missing Telegram Bot Token or Chat ID in environment variables.');
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
        console.error('Failed to send Telegram message:', errorData);
        return NextResponse.json({ error: 'Failed to send Telegram message', details: errorData }, { status: 200 }); // Return 200 to not break flow
    }

    return NextResponse.json({ message: 'Successfully sent Telegram message' }, { status: 200 });

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to send notification', details: errorMessage }, { status: 200 }); // Return 200 to not break flow
  }
}

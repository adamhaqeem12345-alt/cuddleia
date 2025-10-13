
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const telegramRequestSchema = z.object({
  message: z.string(),
});

type TelegramData = z.infer<typeof telegramRequestSchema>;

export async function sendTelegramNotification(data: TelegramData): Promise<{ success: boolean; error?: string }> {
  const validation = telegramRequestSchema.safeParse(data);
  if (!validation.success) {
    console.error('[Telegram Notify] Invalid input:', validation.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input' };
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[Telegram Notify] CRITICAL: Missing Telegram Bot Token or Chat ID in environment variables.');
    return { success: false, error: 'Telegram integration not configured on the server.' };
  }

  try {
    const { message } = validation.data;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `API Error: ${JSON.stringify(errorData)}`;
        console.error(`[Telegram Notify] Failed to send Telegram message. ${errorMessage}`);
        return { success: false, error: `Failed to send Telegram message: ${errorMessage}`};
    }
    
    console.log('[Telegram Notify] Successfully sent Telegram message.');
    return { success: true };

  } catch (error) {
    console.error('[Telegram Notify] Error sending Telegram notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Failed to send notification: ${errorMessage}` };
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await sendTelegramNotification(body);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Telegram notification sent' }, { status: 200 });
  } catch (e) {
    console.error('[Telegram Notify API] Invalid JSON body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

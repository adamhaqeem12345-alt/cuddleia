
import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/server-actions';


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

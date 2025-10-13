
import { NextRequest, NextResponse } from 'next/server';
import { sendProductEmail } from '@/lib/server-actions';


// The POST handler is now just a wrapper for the exported function.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await sendProductEmail(body);
    
    if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('[Email API] Invalid JSON body:', error);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

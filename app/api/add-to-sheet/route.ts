
import { NextRequest, NextResponse } from 'next/server';
import { addOrderToSheet } from '@/lib/server-actions';


// The POST handler is now just a wrapper for the exported function.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await addOrderToSheet(body);

    if (!result.success) {
      // The detailed error is already logged in the function, so we can send a generic server error.
      return NextResponse.json({ error: result.error || 'Failed to add to sheet' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully added to sheet' }, { status: 200 });

  } catch (e) {
    console.error('[Add to Sheet API] Invalid JSON body:', e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

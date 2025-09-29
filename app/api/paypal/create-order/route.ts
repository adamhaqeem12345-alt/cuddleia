'use server';

import { createPayPalOrder } from '@/lib/paypal';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { total } = await req.json();

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount provided.' }, { status: 400 });
    }

    const order = await createPayPalOrder(total);
    
    // Find the approval link
    const approveLink = order.links.find((link: { rel: string }) => link.rel === 'approve');
    
    if (approveLink) {
      return NextResponse.json({ redirectUrl: approveLink.href });
    } else {
      throw new Error('Approve link not found in PayPal response.');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`[API] PayPal Create Order Error: ${errorMessage}`);
    return NextResponse.json({ error: `Could not create PayPal order. ${errorMessage}` }, { status: 500 });
  }
}

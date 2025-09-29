
import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/paypal';
import { Product } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    const { total } = await req.json();

    if (!total || typeof total !== 'number') {
      return NextResponse.json({ error: 'Invalid total amount provided.' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const order = await createPayPalOrder(accessToken, total);

    const approveLink = order.links.find(link => link.rel === 'approve');
    
    if (approveLink) {
      return NextResponse.json({ redirectUrl: approveLink.href });
    } else {
      console.error('PayPal order created, but no approve link found.', order);
      return NextResponse.json({ error: 'Could not retrieve PayPal checkout URL.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create PayPal order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `There was an issue connecting to PayPal: ${errorMessage}` }, { status: 500 });
  }
}

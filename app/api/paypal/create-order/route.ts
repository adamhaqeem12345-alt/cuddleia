import { createOrder } from '@/lib/paypal';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { total } = await req.json();

    // Basic validation
    if (typeof total !== 'string' || isNaN(parseFloat(total))) {
        return NextResponse.json({ error: 'Invalid total amount provided.' }, { status: 400 });
    }

    const { jsonResponse, httpStatusCode } = await createOrder(total);

    if (httpStatusCode !== 201) { // 201 is the expected status for a successful order creation
        console.error("PayPal API Error on Order Creation:", jsonResponse);
        return NextResponse.json({ error: 'Failed to create PayPal order.', details: jsonResponse }, { status: httpStatusCode });
    }

    // Extract the approval link
    const approveUrl = jsonResponse.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approveUrl) {
        return NextResponse.json({ error: 'Could not find PayPal approval link.' }, { status: 500 });
    }

    return NextResponse.json({ approveUrl });

  } catch (error) {
    console.error("Failed to process create-order request:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create order.", details: errorMessage },
      { status: 500 }
    );
  }
}

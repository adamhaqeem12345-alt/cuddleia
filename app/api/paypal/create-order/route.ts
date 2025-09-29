import { createOrder as createPayPalOrder } from '@/lib/paypal';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { total } = await req.json();

    if (typeof total !== 'string' || isNaN(parseFloat(total))) {
        return NextResponse.json({ error: 'Invalid total amount provided.' }, { status: 400 });
    }

    const { jsonResponse, httpStatusCode } = await createPayPalOrder(total);

    if (httpStatusCode !== 201) {
        console.error("PayPal API Error on Order Creation:", jsonResponse);
        const errorMessage = jsonResponse?.details?.[0]?.description || 'Failed to create PayPal order.';
        return NextResponse.json({ error: errorMessage, details: jsonResponse }, { status: httpStatusCode });
    }

    const approveUrl = jsonResponse.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approveUrl) {
        return NextResponse.json({ error: 'Could not find PayPal approval link.' }, { status: 500 });
    }

    // Return the full redirect URL to the client
    return NextResponse.json({ approveUrl, orderID: jsonResponse.id });

  } catch (error) {
    console.error("Failed to process create-order request:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create order.", details: errorMessage },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    const orderData = await createOrder(cartItems);

    if (orderData && orderData.id) {
        // Return only the order ID to the frontend
        return NextResponse.json({ id: orderData.id });
    } else {
        // This case should ideally not be reached if createOrder throws on failure
        return NextResponse.json(
            { error: "PayPal response did not include an order ID." },
            { status: 500 }
        );
    }

  } catch (err: any) {
    // This will catch errors thrown from getPayPalAccessToken or createOrder
    console.error('CREATE-ORDER API CATCH BLOCK: An unexpected error occurred.', err.message);
    return NextResponse.json(
      { error: 'Failed to create PayPal order.', details: err.message },
      { status: 500 }
    );
  }
}

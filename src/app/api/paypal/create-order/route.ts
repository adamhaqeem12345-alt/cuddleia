
import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  console.log("API ROUTE: /api/paypal/create-order received a POST request.");
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("CREATE-ORDER API ERROR: Cart is empty or invalid.");
      return NextResponse.json(
        { error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    console.log("CREATE-ORDER: Calling createOrder helper with cart items:", cartItems);
    const orderData = await createOrder(cartItems);
    
    console.log("CREATE-ORDER: Full response from PayPal createOrder API:", JSON.stringify(orderData, null, 2));

    if (orderData && orderData.id) {
        console.log("CREATE-ORDER API: Success! Returning order ID:", orderData.id);
        return NextResponse.json({ id: orderData.id });
    } else {
        console.error("CREATE-ORDER API ERROR: PayPal response did not include an order ID.");
        return NextResponse.json(
            { error: "PayPal response did not include an order ID." },
            { status: 500 }
        );
    }

  } catch (err: any) {
    console.error('CREATE-ORDER API CATCH BLOCK: An unexpected error occurred.', err);
    // Ensure err.message exists and is a string.
    const errorMessage = err.message || 'An unexpected error occurred.';
    return NextResponse.json(
      { error: 'Failed to create PayPal order.', details: errorMessage },
      { status: 500 }
    );
  }
}

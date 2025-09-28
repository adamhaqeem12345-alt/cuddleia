
import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal-api';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
  console.log("API Route: /api/paypal/create-order received a POST request.");
  try {
    const { cartItems } = (await req.json()) as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("Create-order API Error: Cart is empty or invalid.");
      return NextResponse.json(
        { error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    console.log("Calling createOrder helper with cart items:", cartItems);
    const orderData = await createOrder(cartItems);

    // Log the full response from PayPal but only return the ID to the client
    console.log("Full PayPal create-order response:", orderData);
    
    if (orderData && orderData.id) {
        console.log("API route /api/paypal/create-order successful, returning order ID:", orderData.id);
        return NextResponse.json({ id: orderData.id });
    } else {
        throw new Error("PayPal response did not include an order ID.");
    }

  } catch (err: any) {
    console.error('PayPal API /create-order route error:', err);
    const errorMessage = err.message || 'An unexpected error occurred.';
    return NextResponse.json(
      { error: 'Failed to create PayPal order.', details: errorMessage },
      { status: 500 }
    );
  }
}

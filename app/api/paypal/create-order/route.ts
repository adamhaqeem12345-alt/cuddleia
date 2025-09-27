
import { NextResponse } from 'next/server';
import { createOrder as createPayPalOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';
import type { CartItem } from '@/lib/types';

export async function POST(req: Request) {
    try {
        // A standard API expects a JSON body with defined keys.
        const body = await req.json();
        const { cart }: { cart: CartItem[] } = body;

        // Validate the cart data received from the client.
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty cart provided.' }, { status: 400 });
        }
        
        // Pass the validated cart to the core PayPal library function.
        const order = await createPayPalOrder(cart, allProducts);
        
        // Return the full order object from PayPal, which includes the approval link.
        return NextResponse.json(order);

    } catch (error: any) {
        console.error('API Route Error: Failed to create order:', error);
        // Provide a clear error message to the client.
        const message = error.message || 'An unexpected error occurred while creating the order.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

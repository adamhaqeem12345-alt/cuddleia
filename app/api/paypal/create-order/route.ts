import { NextResponse } from 'next/server';
import { createOrder as createPayPalOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';

export async function POST(req: Request) {
    try {
        // Expect a standard JSON body with a 'cart' key.
        const body = await req.json();
        const cart = body.cart;

        // Validate the cart data received from the client.
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty cart provided.' }, { status: 400 });
        }
        
        // Pass the validated cart to the core PayPal library function.
        const order = await createPayPalOrder(cart, allProducts);
        
        return NextResponse.json(order);

    } catch (error: any) {
        console.error('Failed to create order:', error);
        // Provide a clear error message to the client.
        const message = error.message || 'An unexpected error occurred while creating the order.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

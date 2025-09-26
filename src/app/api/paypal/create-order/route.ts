import { NextResponse } from 'next/server';
import { createOrder as createPaypalOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';
import { USD_TO_MYR_RATE } from '@/lib/currency';

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const { cart } = (await request.json()) as { cart: CartItem[] };

    if (!cart || !Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    let total = 0;
    const items = cart.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.id);
        if (!product) {
            throw new Error(`Product with ID ${cartItem.id} not found.`);
        }
        total += product.price * cartItem.quantity;
        return {
            name: product.name,
            quantity: String(cartItem.quantity),
            unit_amount: {
                currency_code: 'USD',
                value: String(product.price.toFixed(2)),
            },
        };
    });
    
    if (total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }
    
    const orderId = await createPaypalOrder(total);
    return NextResponse.json({ id: orderId });

  } catch (error: any) {
    console.error("API /create-order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

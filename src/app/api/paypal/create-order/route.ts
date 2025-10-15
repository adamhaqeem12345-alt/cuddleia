import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';
import { products } from '@/lib/products';

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { cart }: { cart: CartItem[] } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate total from backend
    let total = 0;
    const items = cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) {
            throw new Error(`Product with ID ${cartItem.id} not found`);
        }
        total += product.price * cartItem.quantity;
        return {
            name: product.name,
            unit_amount: {
                currency_code: 'USD',
                value: product.price.toFixed(2),
            },
            quantity: cartItem.quantity.toString(),
            sku: product.id,
        };
    });

    const order = await createOrder({
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: total.toFixed(2),
            }
          }
        },
        items: items,
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
        brand_name: 'Cuddleia',
        user_action: 'PAY_NOW',
      }
    });

    return NextResponse.json(order);

  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

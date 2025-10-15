import { NextResponse } from 'next/server';
import { createToyyibpayBill } from '@/lib/toyyibpay';
import { products } from '@/lib/products';

interface CartItem {
  id: string;
  quantity: number;
}

interface UserDetails {
    name: string;
    email: string;
    phone: string;
}

export async function POST(req: Request) {
  try {
    const { cart, user }: { cart: CartItem[], user: UserDetails } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!user || !user.name || !user.email || !user.phone) {
        return NextResponse.json({ error: 'User details are required' }, { status: 400 });
    }

    let total = 0;
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) {
            throw new Error(`Product with ID ${cartItem.id} not found`);
        }
        total += product.price * cartItem.quantity;
    });

    const toyyibpayResponse = await createToyyibpayBill(cart, total, user);

    return NextResponse.json(toyyibpayResponse);

  } catch (error: any) {
    console.error("Failed to create ToyyibPay bill:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

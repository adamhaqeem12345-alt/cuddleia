import type { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '@/lib/paypal';
import type { CartItem } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { cart } = req.body as { cart: CartItem[] };

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const orderId = await createOrder(cart);
        
        res.status(200).json({ orderId });

    } catch (error: any) {
        console.error('API Error - create-order:', error);
        res.status(500).json({ error: error.message || 'Failed to create PayPal order' });
    }
}

'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <Button
            size="lg"
            className="w-full rounded-full font-bold shadow-lg transition-transform hover:scale-105"
            onClick={handleAddToCart}
            disabled={added}
        >
            {added ? (
                <>
                    <Check className="mr-2 h-5 w-5" /> Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </>
            )}
        </Button>
    );
}

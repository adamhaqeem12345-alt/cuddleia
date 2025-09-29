'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '@/lib/products';

interface AddToCartButtonProps {
    product: Product;
    showText?: boolean;
}

export function AddToCartButton({ product, showText = false }: AddToCartButtonProps) {
    return (
        <Button size={showText ? 'default' : 'lg'} className="w-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
            <ShoppingCart className="mr-2 h-5 w-5" /> {showText ? 'Add' : 'Add to Cart'}
        </Button>
    )
}

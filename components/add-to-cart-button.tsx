'use client';

import { ShoppingCart } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { Product } from '@/lib/products';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import { useCart } from '@/lib/cart';
import { useState } from 'react';

interface AddToCartButtonProps extends VariantProps<typeof buttonVariants> {
    product: Product;
    showText?: boolean;
    className?: string;
}

export function AddToCartButton({ product, showText = false, variant, className }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    }

    return (
        <Button 
            size={showText ? 'default' : 'lg'} 
            variant={variant} 
            className={cn("font-bold shadow-lg transition-all hover:scale-105 active:scale-95", className)}
            onClick={handleAddToCart}
            disabled={isAdded}
        >
            <ShoppingCart className="mr-2 h-5 w-5" /> 
            {isAdded ? 'Added!' : (showText ? 'Add' : 'Add to Cart')}
        </Button>
    )
}

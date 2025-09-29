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
    className?: string;
}

export function AddToCartButton({ product, variant, size, className }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    }

    const isIconOnly = size === 'icon';

    return (
        <Button 
            size={size || 'lg'}
            variant={variant} 
            className={cn("font-bold shadow-lg transition-all hover:scale-105 active:scale-95", className)}
            onClick={handleAddToCart}
            disabled={isAdded}
        >
            <ShoppingCart className={cn("h-5 w-5", !isIconOnly && "mr-2")} /> 
            {isIconOnly ? <span className="sr-only">Add to Cart</span> : (isAdded ? 'Added!' : 'Add to Cart')}
        </Button>
    )
}

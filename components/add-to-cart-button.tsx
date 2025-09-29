'use client';

import { ShoppingCart } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { Product } from '@/lib/products';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

interface AddToCartButtonProps extends VariantProps<typeof buttonVariants> {
    product: Product;
    showText?: boolean;
    className?: string;
}

export function AddToCartButton({ product, showText = false, variant, className }: AddToCartButtonProps) {
    return (
        <Button size={showText ? 'default' : 'lg'} variant={variant} className={cn("font-bold shadow-lg transition-transform hover:scale-105 active:scale-95", className)}>
            <ShoppingCart className="mr-2 h-5 w-5" /> {showText ? 'Add' : 'Add to Cart'}
        </Button>
    )
}

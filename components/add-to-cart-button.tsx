
'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { Product } from '@/lib/products';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import { useCart } from '@/lib/cart';
import { useState } from 'react';
import { ReactNode } from 'react';

interface AddToCartButtonProps extends VariantProps<typeof buttonVariants> {
    product: Product;
    className?: string;
    children?: ReactNode;
}

export function AddToCartButton({ product, variant, size, className, children }: AddToCartButtonProps) {
    const { addToCart, items } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const isProductInCart = items.some(item => item.id === product.id);

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Stop the event from propagating to the parent Link
        if (isProductInCart) return;
        
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    }

    const isIconOnly = size === 'icon';

    if (isProductInCart) {
        return (
            <Button 
                size={size || 'lg'}
                variant={variant} 
                className={cn("font-bold shadow-lg transition-all", className)}
                disabled={true}
                onClick={(e) => e.preventDefault()}
            >
                <Check className={cn("h-5 w-5", !isIconOnly && "mr-2")} /> 
                {isIconOnly ? <span className="sr-only">Added</span> : 'Added!'}
            </Button>
        )
    }
    
    return (
        <Button 
            size={size || 'lg'}
            variant={variant} 
            className={cn("font-bold shadow-lg transition-all hover:scale-105 active:scale-95", className)}
            onClick={handleAddToCart}
            disabled={isAdded}
        >
            {children ? (
                isAdded ? <><Check className="mr-2 h-5 w-5"/> Added!</> : children
            ) : (
                <>
                    <ShoppingCart className={cn("h-5 w-5", !isIconOnly && "mr-2")} /> 
                    {isIconOnly ? <span className="sr-only">Add to Cart</span> : (isAdded ? 'Added!' : 'Add to Cart')}
                </>
            )}
        </Button>
    )
}

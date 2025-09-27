'use client';

import { useCart } from '@/context/cart-context';

export function ProductPrice({ price, className }: { price: number, className?: string }) {
    const { getPrice } = useCart();
    const { usd, myr } = getPrice(price);
    
    return (
        <div className={className}>
            <p className="font-headline text-3xl font-bold text-primary">{usd.formatted}</p>
            <p className="text-sm text-muted-foreground">(Approx. {myr.formatted})</p>
        </div>
    )
}

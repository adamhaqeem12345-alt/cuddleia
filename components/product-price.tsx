
'use client';

interface ProductPriceProps {
    price: number;
    originalPrice?: number;
    simple?: boolean;
}

export function ProductPrice({ price, originalPrice, simple = false }: ProductPriceProps) {
    
    if (simple) {
        return <span>{price > 0 ? `$${price.toFixed(2)}` : 'Free'}</span>
    }
    
    if(price === 0) {
        return (
             <div>
                <p className="text-xl font-headline font-bold text-primary">Free</p>
            </div>
        )
    }

    // Since paid products are removed, this part is less likely to be rendered
    // but is kept for future-proofing.
    return (
        <div>
            <div className="flex items-center gap-2">
                <p className="text-xl font-headline font-bold text-primary">${price.toFixed(2)} USD</p>
                {originalPrice && originalPrice > price && (
                    <p className="text-lg font-headline font-bold text-muted-foreground line-through">${originalPrice.toFixed(2)} USD</p>
                )}
            </div>
        </div>
    )
}

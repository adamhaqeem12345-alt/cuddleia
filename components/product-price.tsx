
'use client';

import { useEffect, useState } from 'react';

interface ProductPriceProps {
    price: number;
    originalPrice?: number;
    simple?: boolean;
}

export function ProductPrice({ price, originalPrice, simple = false }: ProductPriceProps) {
    const [priceMYR, setPriceMYR] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (price > 0) {
            setIsLoading(true);
            fetch('/api/exchange-rate')
                .then(res => res.json())
                .then(data => {
                    if (data.rate) {
                        const calculatedPrice = (price * data.rate).toFixed(2);
                        setPriceMYR(calculatedPrice);
                    }
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [price]);

    const displayPrice = `$${price.toFixed(2)} USD`;
    const displayOriginalPrice = originalPrice ? `$${originalPrice.toFixed(2)} USD` : '';

    if (simple) {
        return <span>{displayPrice}</span>
    }
    
    if(price === 0) {
        return (
             <div>
                <p className="text-xl font-headline font-bold text-primary">Free</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center gap-2">
                <p className="text-xl font-headline font-bold text-primary">{displayPrice}</p>
                {originalPrice && originalPrice > price && (
                    <p className="text-lg font-headline font-bold text-muted-foreground line-through">{displayOriginalPrice}</p>
                )}
            </div>
            {isLoading 
                ? <p className="text-xs text-muted-foreground">Loading conversion...</p> 
                : (priceMYR && <p className="text-xs text-muted-foreground">(Approx. RM{priceMYR})</p>)
            }
        </div>
    )
}

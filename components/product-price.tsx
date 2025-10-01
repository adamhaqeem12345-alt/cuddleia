
'use client';

import { useEffect, useState } from 'react';

interface ProductPriceProps {
    price: number;
}

export function ProductPrice({ price }: ProductPriceProps) {
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

    if(price === 0) {
        return (
             <div>
                <p className="text-xl font-headline font-bold text-primary">Free</p>
            </div>
        )
    }

    return (
        <div>
            <p className="text-xl font-headline font-bold text-primary">${price.toFixed(2)} USD</p>
            {isLoading 
                ? <p className="text-xs text-muted-foreground">Loading conversion...</p> 
                : (priceMYR && <p className="text-xs text-muted-foreground">(Approx. RM{priceMYR})</p>)
            }
        </div>
    )
}

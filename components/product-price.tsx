'use client';

import { useEffect, useState } from 'react';

const USD_TO_MYR = 4.21; // Updated exchange rate

interface ProductPriceProps {
    price: number;
}

export function ProductPrice({ price }: ProductPriceProps) {
    const [priceMYR, setPriceMYR] = useState('');

    useEffect(() => {
        const calculatedPrice = (price * USD_TO_MYR).toFixed(2);
        setPriceMYR(calculatedPrice);
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
            {priceMYR && <p className="text-xs text-muted-foreground">(Approx. RM{priceMYR})</p>}
        </div>
    )
}

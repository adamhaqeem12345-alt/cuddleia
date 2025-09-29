'use client';

const USD_TO_MYR = 4.21;

interface ProductPriceProps {
    price: number;
}

export function ProductPrice({ price }: ProductPriceProps) {
    const priceMYR = (price * USD_TO_MYR).toFixed(2);
    return (
        <div>
            <p className="text-xl font-headline font-bold text-primary">${price.toFixed(2)} USD</p>
            <p className="text-xs text-muted-foreground">(Approx. RM{priceMYR})</p>
        </div>
    )
}

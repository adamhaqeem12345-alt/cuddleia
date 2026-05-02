
'use client';

import { useState, useEffect } from 'react';
import { getConvertedAmount } from '@/app/actions';

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  isTotal?: boolean;
}

export const ProductPrice = ({ price, originalPrice, isTotal = false }: ProductPriceProps) => {
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConvertedPrice = async () => {
      if (price > 0) {
        try {
          setIsLoading(true);
          const myrAmount = await getConvertedAmount(price);
          setConvertedPrice(myrAmount);
        } catch (error) {
          console.error("Failed to fetch converted price:", error);
          setConvertedPrice(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchConvertedPrice();
  }, [price]);

  if (price === 0) {
    return (
      <p className="text-xl font-headline font-bold text-primary">
        Free
      </p>
    );
  }

  const priceStyle = isTotal ? "text-2xl" : "text-xl";
  const originalPriceStyle = isTotal ? "text-lg" : "text-base";

  return (
    <div className={isTotal ? 'text-right' : ''}>
        <div className="flex items-baseline gap-2" style={{justifyContent: isTotal ? 'flex-end' : 'flex-start'}}>
            {originalPrice && (
                <p className={`${originalPriceStyle} font-headline font-bold text-muted-foreground line-through`}>
                    ${originalPrice.toFixed(2)}
                </p>
            )}
            <p className={`${priceStyle} font-headline font-bold text-primary`}>
                ${price.toFixed(2)}
            </p>
        </div>
        <div className="h-6">
            {isLoading ? (
                <div className="h-4 w-20 bg-muted/50 rounded animate-pulse mt-1" style={{marginLeft: isTotal ? 'auto' : '0'}}></div>
            ) : convertedPrice !== null ? (
                <p className="text-sm text-muted-foreground">
                    (approx. RM {convertedPrice.toFixed(2)})
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">USD</p>
            )}
        </div>
    </div>
  );
};

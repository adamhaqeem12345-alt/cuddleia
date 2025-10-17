
'use client';

import { useState, useEffect } from 'react';

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  isTotal?: boolean;
}

export const ProductPrice = ({ price, originalPrice, isTotal = false }: ProductPriceProps) => {

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
    <div>
        <div className="flex items-baseline gap-2">
            <p className={`${priceStyle} font-headline font-bold text-primary`}>
                ${price.toFixed(2)}
            </p>
            {originalPrice && (
                <p className={`${originalPriceStyle} font-headline font-bold text-muted-foreground line-through`}>
                    ${originalPrice.toFixed(2)}
                </p>
            )}
        </div>
        <div className="h-6">
           <p className="text-sm text-muted-foreground">USD</p>
        </div>
    </div>
  );
};

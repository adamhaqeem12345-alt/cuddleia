'use client';

import { useState, useEffect } from 'react';
// import { convertCurrency } from '@/ai/flows/currency-converter-flow';

export const CurrencyConverter = ({ usdPrice }: { usdPrice: number }) => {
  /*
  const [myrPrice, setMyrPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (usdPrice === 0) {
      setIsLoading(false);
      return;
    }

    const getConversion = async () => {
      try {
        setIsLoading(true);
        const result = await convertCurrency({
          amount: usdPrice,
          from: 'USD',
          to: 'MYR',
        });
        setMyrPrice(`approx. RM ${result.convertedAmount.toFixed(2)}`);
      } catch (error) {
        console.error('Failed to convert currency:', error);
        setMyrPrice(null); // Don't show conversion on error
      } finally {
        setIsLoading(false);
      }
    };

    getConversion();
  }, [usdPrice]);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading conversion...</p>;
  }

  if (!myrPrice) {
    return null; // Don't render anything if conversion fails or not applicable
  }
  */

  if (usdPrice === 0) {
    return null;
  }

  const myrPrice = `approx. RM ${(usdPrice * 4.7).toFixed(2)}`;

  return <p className="text-xs text-muted-foreground">{myrPrice}</p>;
};

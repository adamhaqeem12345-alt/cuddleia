'use server';

import { z } from 'zod';
import fetch from 'node-fetch';

export const CurrencyConversionInputSchema = z.object({
  amount: z.number().describe('The amount of money to convert'),
  from: z.string().default('USD').describe('The currency to convert from'),
  to: z.string().default('MYR').describe('The currency to convert to'),
});
export type CurrencyConversionInput = z.infer<typeof CurrencyConversionInputSchema>;

export const CurrencyConversionOutputSchema = z.object({
  convertedAmount: z.number().describe('The converted amount'),
  currency: z.string().describe('The currency of the converted amount'),
});
export type CurrencyConversionOutput = z.infer<typeof CurrencyConversionOutputSchema>;

async function getExchangeRate(from: string, to: string): Promise<number> {
    console.log(`Fetching exchange rate from ${from} to ${to}`);
    // Using a free, public API. In a real app, prefer a paid, reliable service.
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data: any = await response.json();
    console.log('Exchange rate data:', data);
    return data.rates[to];
}


export async function convertCurrency(input: CurrencyConversionInput): Promise<CurrencyConversionOutput> {
    const { amount, from, to } = input;
    
    const rate = await getExchangeRate(from, to);
    
    const convertedAmount = amount * rate;
    
    return {
      convertedAmount,
      currency: to,
    };
}

/*
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const ExchangeRateInputSchema = z.object({
  from: z.string().describe('The currency to convert from (e.g., USD)'),
  to: z.string().describe('The currency to convert to (e.g., MYR)'),
});

const getExchangeRateTool = ai.defineTool(
  {
    name: 'getExchangeRate',
    description: 'Get the latest exchange rate between two currencies.',
    inputSchema: ExchangeRateInputSchema,
    outputSchema: z.number(),
  },
  async ({ from, to }) => {
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
);

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


const currencyConverterFlow = ai.defineFlow(
  {
    name: 'currencyConverterFlow',
    inputSchema: CurrencyConversionInputSchema,
    outputSchema: CurrencyConversionOutputSchema,
  },
  async ({ amount, from, to }) => {
    
    const rate = await getExchangeRateTool({from, to});
    
    const convertedAmount = amount * rate;
    
    return {
      convertedAmount,
      currency: to,
    };
  }
);

export async function convertCurrency(input: CurrencyConversionInput): Promise<CurrencyConversionOutput> {
    return currencyConverterFlow(input);
}
*/
'use server';

import { z } from 'zod';

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

export async function convertCurrency(input: CurrencyConversionInput): Promise<CurrencyConversionOutput> {
    // Dummy implementation
    return {
      convertedAmount: input.amount * 4.7, // Example static rate
      currency: input.to,
    };
}

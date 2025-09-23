
'use server';
/**
 * @fileOverview An AI flow to determine the appropriate payment gateway.
 *
 * - determinePaymentGateway - A function that selects a payment gateway based on the user's country.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PaymentGatewaySchema = z.enum(['ToyyibPay', 'PayPal']);

const determinePaymentGatewayFlow = ai.defineFlow(
  {
    name: 'determinePaymentGatewayFlow',
    inputSchema: z.string(),
    outputSchema: PaymentGatewaySchema,
  },
  async (countryCode) => {
    const prompt = `You are a payment gateway routing expert. Based on the user's country code, determine the best payment gateway.
    - If the country code is 'MY' (Malaysia), you MUST respond with 'ToyyibPay'.
    - For ANY other country code, you MUST respond with 'PayPal'.

    User's Country Code: ${countryCode}`;

    const { output } = await ai.generate({
      prompt,
      output: {
        schema: PaymentGatewaySchema,
      },
    });

    return output ?? 'PayPal';
  }
);

export async function determinePaymentGateway(countryCode: string): Promise<z.infer<typeof PaymentGatewaySchema>> {
    return await determinePaymentGatewayFlow(countryCode);
}

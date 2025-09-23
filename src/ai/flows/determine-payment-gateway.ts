'use server';

/**
 * @fileOverview A payment gateway determination AI agent.
 *
 * - determinePaymentGateway - A function that determines the appropriate payment gateway.
 * - DeterminePaymentGatewayInput - The input type for the determinePaymentGateway function.
 * - DeterminePaymentGatewayOutput - The return type for the determinePaymentGateway function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeterminePaymentGatewayInputSchema = z.object({
  country: z
    .string()
    .optional()
    .describe('The country of the customer, provided by the user.'),
});
export type DeterminePaymentGatewayInput = z.infer<typeof DeterminePaymentGatewayInputSchema>;

const DeterminePaymentGatewayOutputSchema = z.object({
  paymentGateway: z
    .enum(['toyyibpay', 'paypal'])
    .describe('The recommended payment gateway for the customer.'),
});
export type DeterminePaymentGatewayOutput = z.infer<typeof DeterminePaymentGatewayOutputSchema>;

export async function determinePaymentGateway(
  input: DeterminePaymentGatewayInput
): Promise<DeterminePaymentGatewayOutput> {
  return determinePaymentGatewayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determinePaymentGatewayPrompt',
  input: {schema: DeterminePaymentGatewayInputSchema},
  output: {schema: DeterminePaymentGatewayOutputSchema},
  prompt: `You are an expert in payment gateway selection.

  Based on the country of the customer, recommend the appropriate payment gateway.

  If the country is Malaysia, recommend ToyyibPay.
  If the country is not Malaysia, recommend PayPal.

  Country: {{{country}}}
  Payment Gateway:`,
});

const determinePaymentGatewayFlow = ai.defineFlow(
  {
    name: 'determinePaymentGatewayFlow',
    inputSchema: DeterminePaymentGatewayInputSchema,
    outputSchema: DeterminePaymentGatewayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

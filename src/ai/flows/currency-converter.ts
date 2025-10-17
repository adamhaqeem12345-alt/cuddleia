// This file is temporarily disabled to resolve build errors.
// 'use server';

// /**
//  * @fileOverview A currency conversion AI flow.
//  * - convertUsdToMyr - Converts a USD amount to MYR using a real-time exchange rate.
//  * - ConvertUsdToMyrInput - The input type for the flow.
//  * - ConvertUsdToMyrOutput - The output type for the flow.
//  */

// import { ai } from '@/ai/genkit';
// import { z } from 'zod';

// export const ConvertUsdToMyrInputSchema = z.object({
//   usdAmount: z.number().describe('The amount in USD to convert.'),
// });
// export type ConvertUsdToMyrInput = z.infer<typeof ConvertUsdToMyrInputSchema>;

// export const ConvertUsdToMyrOutputSchema = z.object({
//   myrAmount: z.number().describe('The converted amount in MYR.'),
// });
// export type ConvertUsdToMyrOutput = z.infer<typeof ConvertUsdToMyrOutputSchema>;


// const converterPrompt = ai.definePrompt({
//   name: 'currencyConverterPrompt',
//   input: { schema: ConvertUsdToMyrInputSchema },
//   output: { schema: ConvertUsdToMyrOutputSchema },
//   prompt: `You are a currency exchange expert.
//     Find the most recent, real-time exchange rate for USD to MYR.
//     Convert the given amount in USD to MYR.
//     Return only the converted amount as a number.
    
//     USD Amount: {{{usdAmount}}}`,
// });

// const currencyConverterFlow = ai.defineFlow(
//   {
//     name: 'currencyConverterFlow',
//     inputSchema: ConvertUsdToMyrInputSchema,
//     outputSchema: ConvertUsdToMyrOutputSchema,
//   },
//   async (input) => {
//     const { output } = await converterPrompt(input);
//     return output!;
//   }
// );

// export async function convertUsdToMyr(
//   input: ConvertUsdToMyrInput
// ): Promise<ConvertUsdToMyrOutput> {
//   return await currencyConverterFlow(input);
// }

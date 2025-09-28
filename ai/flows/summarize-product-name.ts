'use server';
/**
 * @fileOverview An AI flow to shorten product names for API compliance.
 *
 * - summarizeProductName - A function that shortens a product name if it exceeds a specified length.
 * - SummarizeProductNameInput - The input type for the summarizeProductName function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeProductNameInputSchema = z.object({
  productName: z.string().describe('The product name to summarize.'),
});
export type SummarizeProductNameInput = z.infer<
  typeof SummarizeProductNameInputSchema
>;

const prompt = ai.definePrompt({
  name: 'summarizeProductNamePrompt',
  input: { schema: SummarizeProductNameInputSchema },
  prompt: `You are an expert copywriter. Your task is to shorten a product title to be under 127 characters.

The shortened title must be clear, concise, and accurately represent the original product. Do not add any conversational text or apologies. Only return the shortened title.

If the product title is already 127 characters or less, return the original title verbatim.

Original Title: {{{productName}}}
Shortened Title:`,
});

const summarizeProductNameFlow = ai.defineFlow(
  {
    name: 'summarizeProductNameFlow',
    inputSchema: SummarizeProductNameInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    if (input.productName.length <= 127) {
      return input.productName;
    }
    const { output } = await prompt(input);
    return output || input.productName.substring(0, 127); // Fallback to truncation
  }
);

export async function summarizeProductName(
  productName: string
): Promise<string> {
  return await summarizeProductNameFlow({ productName });
}

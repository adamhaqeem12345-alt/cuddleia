
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
    const { output } = await prompt(input);
    // Fallback to simple truncation if AI fails or returns an empty response
    return output || input.productName.substring(0, 127);
  }
);

export async function summarizeProductName(
  productName: string
): Promise<string> {
  // Ensure we only call the flow if necessary
  if (productName.length <= 127) {
    return productName;
  }
  return await summarizeProductNameFlow({ productName });
}

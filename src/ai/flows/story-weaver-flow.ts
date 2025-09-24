
'use server';
/**
 * @fileOverview An AI flow to generate a short, inspiring Islamic story based on a product.
 *
 * - generateStory - A function that handles the story generation process.
 * - StoryWeaverInput - The input type for the generateStory function.
 * - StoryWeaverOutput - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

export const StoryWeaverInputSchema = z.object({
  productName: z.string().describe('The name of the digital product.'),
  productDescription: z.string().describe('The description of the digital product.'),
});
export type StoryWeaverInput = z.infer<typeof StoryWeaverInputSchema>;

export const StoryWeaverOutputSchema = z.object({
  story: z.string().describe('A short, uplifting, and inspiring Islamic story or reflection related to the product.'),
});
export type StoryWeaverOutput = z.infer<typeof StoryWeaverOutputSchema>;

const storyWeaverPrompt = ai.definePrompt({
    name: 'storyWeaverPrompt',
    input: { schema: StoryWeaverInputSchema },
    output: { schema: StoryWeaverOutputSchema },
    prompt: `You are a gentle and wise storyteller. Your purpose is to craft short, inspiring, and uplifting Islamic stories or reflections that bring a sense of peace and warmth. Your voice is like a kind grandmother sharing wisdom.

You will be given the name and description of a digital product from a store called "Cuddleia". Based on this product, you are to write a unique story or reflection.

The story must:
- Be related to the theme of the product. For example, if the product is about business, tell a story about honesty or putting barakah (blessing) in one's work. If it's a wallpaper with a verse about patience, tell a story about the beauty of sabr (patience).
- Be heartwarming and leave the reader with a positive feeling.
- Be short, around 150-200 words.
- Conclude with a gentle prayer or a positive wish for the reader, like "May you find peace in these words." or "May your heart be filled with light."

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
`,
    config: {
        temperature: 0.8,
    }
});

const storyWeaverFlow = ai.defineFlow(
  {
    name: 'storyWeaverFlow',
    inputSchema: StoryWeaverInputSchema,
    outputSchema: StoryWeaverOutputSchema,
  },
  async (input) => {
    const { output } = await storyWeaverPrompt(input);
    return output!;
  }
);

export async function generateStory(input: StoryWeaverInput): Promise<StoryWeaverOutput> {
  return storyWeaverFlow(input);
}

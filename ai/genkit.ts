'use server';
/**
 * @fileOverview Initializes the Genkit AI instance.
 *
 * This file sets up the global `ai` object that is used throughout the application
 * to define and run AI flows. It configures the necessary plugins, such as the
 * Google AI plugin for accessing Gemini models.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is set via the GEMINI_API_KEY environment variable
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

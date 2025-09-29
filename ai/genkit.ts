'use server';
/**
 * @fileOverview Initializes the Genkit AI instance.
 *
 * This file sets up the global `ai` object that is used throughout the application
 * to define and run AI flows. It configures the necessary plugins, such as the
 * Google AI plugin for accessing Gemini models.
 */

import { genkit, GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Conditionally initialize plugins based on environment variable availability.
// This prevents build-time errors when environment variables are not set.
const plugins: GenkitPlugin[] = [];
if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins: plugins,
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

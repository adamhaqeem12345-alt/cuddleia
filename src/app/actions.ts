
'use server';

// The AI flow is temporarily disabled to resolve a package dependency issue.
// import { convertUsdToMyr } from '@/ai/flows/currency-converter';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  // Returning null as the AI flow is disabled.
  return null;
}

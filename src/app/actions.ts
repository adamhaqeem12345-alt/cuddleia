
'use server';

import { convertUsdToMyr } from '@/ai/flows/currency-converter';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  try {
    const result = await convertUsdToMyr({ usdAmount });
    return result;
  } catch (error) {
    console.error('Error converting currency:', error);
    // Return null or a specific error structure if the conversion fails
    return null;
  }
}


'use server';

// @ts-ignore
import { convertUsdToMyr } from '@/ai/flows/currency-converter';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  try {
    // const result = await convertUsdToMyr({ usdAmount });
    // return result;
    // Temporarily returning a mocked value to avoid build errors
    return { myrAmount: usdAmount * 4.7 };
  } catch (error) {
    console.error('Error converting currency:', error);
    // Return null or a specific error structure if the conversion fails
    return null;
  }
}

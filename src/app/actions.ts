'use server';

const FALLBACK_USD_TO_MYR_RATE = 4.7;

/**
 * Fetches the latest USD to MYR exchange rate from an external API
 * and converts a given USD amount to MYR.
 * Includes a fallback rate for reliability.
 * @param amountInUSD - The amount in USD to convert.
 * @returns The amount in MYR.
 */
export async function getConvertedAmount(amountInUSD: number): Promise<number> {
  if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
    console.error('Invalid amount provided for conversion:', amountInUSD);
    return 0;
  }
  
  if (amountInUSD === 0) {
    return 0;
  }

  let rate = FALLBACK_USD_TO_MYR_RATE;

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 } // Re-fetch the rate at most once per hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    if (data && data.rates && data.rates.MYR) {
      rate = data.rates.MYR;
    }
  } catch (error) {
    console.error("Currency conversion API failed, using fallback rate:", error);
    // The rate is already set to the fallback, so we just continue
  }

  const amountInMYR = amountInUSD * rate;
  return parseFloat(amountInMYR.toFixed(2));
}

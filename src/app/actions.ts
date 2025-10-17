'use server';

const USD_TO_MYR_RATE = 4.7;

/**
 * Converts a USD amount to MYR using a fixed rate.
 * Note: This uses a fixed rate for reliability and to avoid external API failures.
 * @param amountInUSD - The amount in USD to convert.
 * @returns The amount in MYR.
 */
export async function getConvertedAmount(amountInUSD: number): Promise<number> {
  if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
    console.error('Invalid amount provided for conversion:', amountInUSD);
    return 0;
  }
  const amountInMYR = amountInUSD * USD_TO_MYR_RATE;
  return parseFloat(amountInMYR.toFixed(2));
}

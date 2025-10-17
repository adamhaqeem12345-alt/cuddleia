
'use server';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  
  try {
    // Switched to a different provider for potentially more accurate rates.
    const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', {
      // Revalidate every 6 hours to get reasonably fresh rates
      next: { revalidate: 21600 } 
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates.');
    }

    const data = await response.json();
    
    // This API nests the rates under a 'usd' key.
    const exchangeRate = data.usd?.myr;

    if (!exchangeRate) {
      throw new Error('MYR exchange rate not found in the new API response.');
    }

    const myrAmount = usdAmount * exchangeRate;
    
    return { myrAmount };
  } catch (error) {
    console.error('Currency conversion failed:', error);
    // Return null so the frontend can handle the error gracefully
    return null;
  }
}

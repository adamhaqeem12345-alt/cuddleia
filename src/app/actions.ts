
'use server';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  
  try {
    // Switched to a different provider for potentially more accurate rates.
    // This API does not require an API key for basic use.
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      // Revalidate every 6 hours to get reasonably fresh rates
      next: { revalidate: 21600 } 
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates.');
    }

    const data = await response.json();
    
    // This API nests the rates under a 'rates' key.
    const exchangeRate = data.rates?.MYR;

    if (!exchangeRate) {
      throw new Error('MYR exchange rate not found in API response.');
    }

    const myrAmount = usdAmount * exchangeRate;
    
    return { myrAmount };
  } catch (error) {
    console.error('Currency conversion failed:', error);
    // Return null so the frontend can handle the error gracefully
    return null;
  }
}

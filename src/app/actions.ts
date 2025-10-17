
'use server';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  
  try {
    // Switched to a new provider for potentially better accuracy.
    // This endpoint uses a community-managed proxy for a popular service.
    const response = await fetch('https://latest.currency-api.pages.dev/v1/currencies/usd.json', {
      // Revalidate every 6 hours
      next: { revalidate: 21600 } 
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates.');
    }

    const data = await response.json();
    
    // Carefully handle the new API's JSON structure: { "usd": { "myr": 4.7... } }
    const exchangeRate = data?.usd?.myr;

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

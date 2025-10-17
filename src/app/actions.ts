
'use server';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  
  try {
    // Switched to a new provider for better accuracy.
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      // Revalidate every 6 hours
      next: { revalidate: 21600 } 
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates from new provider.');
    }

    const data = await response.json();
    
    // Carefully handle the new API's JSON structure: { "rates": { "MYR": 4.7... } }
    const exchangeRate = data?.rates?.MYR;

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


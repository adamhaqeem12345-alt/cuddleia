
'use server';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  
  try {
    // Using a reliable, key-less API.
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    const exchangeRate = data.rates.MYR;

    if (exchangeRate) {
        const myrAmount = usdAmount * exchangeRate;
        return { myrAmount };
    }
    // Return null if the rate isn't available
    return null;

  } catch (error) {
    console.error('Currency conversion failed:', error);
    // Return null so the frontend can handle the error gracefully
    return null;
  }
}

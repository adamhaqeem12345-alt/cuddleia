
'use server';

export async function getConvertedAmount(usdAmount: number) {
  if (usdAmount === 0) {
    return { myrAmount: 0 };
  }
  
  try {
    // Per your request, using a fixed exchange rate for accuracy.
    const fixedExchangeRate = 4.23;
    const myrAmount = usdAmount * fixedExchangeRate;
    
    // Using Promise.resolve to maintain the async function structure.
    return await Promise.resolve({ myrAmount });

  } catch (error) {
    console.error('Currency conversion failed:', error);
    // Return null so the frontend can handle the error gracefully
    return null;
  }
}

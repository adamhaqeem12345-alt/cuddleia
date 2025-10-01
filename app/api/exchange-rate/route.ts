
import { NextResponse } from 'next/server';

// We can cache the result to avoid hitting the API on every single request.
// The 'force-dynamic' segment config option will bypass this, but for other cases it's useful.
let cachedRate: number | null = null;
let lastFetchTime: number | null = null;

// Cache duration: 4 hours in milliseconds
const CACHE_DURATION = 4 * 60 * 60 * 1000; 

// This tells Next.js to always run this function dynamically on the server.
// It prevents the response from being cached by the server, so we can implement our own caching.
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = Date.now();

  // Use cache if it's not expired
  if (cachedRate && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    return NextResponse.json({ rate: cachedRate, source: 'cache' });
  }

  try {
    // Using a free, no-key-required API.
    // In a production scenario, it's better to use a reliable service with an API key.
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate, status: ${response.status}`);
    }

    const data = await response.json();
    const rate = data?.rates?.MYR;

    if (!rate) {
      throw new Error('MYR rate not found in API response');
    }

    // Update cache
    cachedRate = rate;
    lastFetchTime = now;

    return NextResponse.json({ rate, source: 'api' });
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    // If the API fails, we can fall back to the last cached rate if it exists.
    if (cachedRate) {
        return NextResponse.json({ rate: cachedRate, source: 'stale-cache' });
    }
    // Or return an error if there's no cache.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: "Could not fetch exchange rate", details: errorMessage }, { status: 500 });
  }
}

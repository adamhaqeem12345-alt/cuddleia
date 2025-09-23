'use server';

import { determinePaymentGateway } from '@/ai/flows/determine-payment-gateway';

// In a real-world scenario, these would be your actual payment gateway URLs
const TOYYIBPAY_URL = 'https://toyyibpay.com/';
const PAYPAL_URL = 'https://www.paypal.com/';

type CountryOption = 'Malaysia' | 'Other';

export async function handlePaymentRedirect(country: CountryOption): Promise<{ url: string; error?: string }> {
  try {
    const result = await determinePaymentGateway({ country });

    if (result.paymentGateway === 'toyyibpay') {
      console.log('Redirecting to ToyyibPay for Malaysian customer.');
      return { url: TOYYIBPAY_URL };
    } else {
      console.log('Redirecting to PayPal for International customer.');
      return { url: PAYPAL_URL };
    }
  } catch (error) {
    console.error('Failed to determine payment gateway:', error);
    return { url: '', error: 'Could not determine payment gateway. Please try again.' };
  }
}

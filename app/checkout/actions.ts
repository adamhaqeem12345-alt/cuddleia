
'use server';

import { redirect } from 'next/navigation';
import { Product } from '@/lib/products';

const TOYYIBPAY_SECRET = 'rx6j88vd-eye6-g5xf-s91k-a4c616556wpr';
const TOYYIBPAY_CATEGORY_CODE = '43cm97xz';
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function createToyyibpayBill(
  items: Product[],
  total: number,
  customerName: string,
  customerEmail: string
) {
  const billName = items.map((item) => item.name).join(', ');
  const billDescription = `Payment for: ${billName}`;
  const amountInCents = Math.round(total * 100);

  const params = new URLSearchParams();
  params.append('userSecretKey', TOYYIBPAY_SECRET);
  params.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
  params.append('billName', 'Cuddleia Order');
  params.append('billDescription', billDescription);
  params.append('billPrice', amountInCents.toString());
  params.append('billAmount', amountInCents.toString());
  params.append('billReturnUrl', 'http://localhost:3000/cart');
  params.append('billCallbackUrl', 'http://localhost:3000/api/webhook/toyyibpay');
  params.append('billTo', customerName);
  params.append('billEmail', customerEmail);
  params.append('billPhone', '0000000000'); // Placeholder phone

  try {
    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      body: params,
    });

    // ToyyibPay might return errors with a 200 OK status, so we need to inspect the body
    const data = await response.json();

    if (data && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      redirect(TOYYIBPAY_BILL_URL + billCode);
    } else {
      // If there's no BillCode, it's an error. Log the actual response from ToyyibPay.
      console.error('ToyyibPay API Error Response:', data);
      throw new Error('Could not create ToyyibPay bill. The API returned an error.');
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    // Re-throw a generic error to be caught by the client
    throw new Error('There was an issue connecting to our payment provider. Please try again later.');
  }
}

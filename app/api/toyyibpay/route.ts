
import { NextRequest, NextResponse } from 'next/server';

const TOYYIBPAY_SECRET = 'rx6j88vd-eye6-g5xf-s91k-a4c616556wpr';
const TOYYIBPAY_CATEGORY_CODE = '43cm97xz';
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function POST(req: NextRequest) {
  try {
    // HARDCODED TEST DATA - Direct translation of the PHP example's logic
    const testAmount = '100'; // Represents 1.00 currency unit
    const testDescription = 'Test payment from Cuddleia';
    const testName = 'Test Customer';
    const testEmail = 'test@example.com';
    const testPhone = '0123456789';

    const params = new URLSearchParams();
    params.append('userSecretKey', TOYYIBPAY_SECRET);
    params.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    params.append('billName', 'Cuddleia Test Order');
    params.append('billDescription', testDescription);
    params.append('billPrice', testAmount);
    params.append('billAmount', testAmount);
    params.append('billReturnUrl', 'https://www.cuddleia.com/cart');
    params.append('billCallbackUrl', 'https://www.cuddleia.com/api/webhook/toyyibpay');
    params.append('billTo', testName);
    params.append('billEmail', testEmail);
    params.append('billPhone', testPhone);

    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      body: params,
    });
    
    // The response from ToyyibPay is expected to be a JSON array.
    const data = await response.json();
    
    // Check if the response from ToyyibPay is an array with a BillCode.
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = TOYYIBPAY_BILL_URL + billCode;
      // This is the success case. We return the URL to the client.
      return NextResponse.json({ paymentUrl });
    } else {
      // This is the failure case. Log the exact response from ToyyibPay for debugging.
      console.error('ToyyibPay API Error Response:', data);
      const errorMessage = data && Array.isArray(data) && data.length > 0 && data[0].msg ? data[0].msg : 'Unknown API error';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    return NextResponse.json({ error: 'There was an issue connecting to our payment provider.' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';

// Using the EXACT sample credentials from the user-provided documentation for a hardcoded test.
const TOYYIBPAY_SECRET = 'w5x7srq7-rx5r-3t89-2ou2-k7361x2jewhn'; // From user's PHP example
const TOYYIBPAY_CATEGORY_CODE = 'j0tzqhka'; // From user's PHP example result
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function POST(req: NextRequest) {
  try {
    // This is a hardcoded test to isolate the problem.
    // It uses static data to mirror the PHP examples precisely.
    const params = new URLSearchParams();
    params.append('userSecretKey', TOYYIBPAY_SECRET);
    params.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    params.append('billName', 'Cuddleia Test Order');
    params.append('billDescription', 'A hardcoded test payment');
    params.append('billPrice', '100'); // Represents RM1.00
    params.append('billAmount', '100'); // Represents RM1.00
    params.append('billReturnUrl', 'https://www.cuddleia.com/cart');
    params.append('billCallbackUrl', 'https://www.cuddleia.com/api/webhook/toyyibpay');
    params.append('billTo', 'Test Customer');
    params.append('billEmail', 'test@example.com');
    params.append('billPhone', '0123456789');

    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      body: params,
    });
    
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = TOYYIBPAY_BILL_URL + billCode;
      return NextResponse.json({ paymentUrl });
    } else {
      console.error('ToyyibPay API Error Response:', data);
      const errorMessage = data && Array.isArray(data) && data.length > 0 && data[0].msg ? data[0].msg : 'Unknown API error';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    return NextResponse.json({ error: 'There was an issue connecting to our payment provider.' }, { status: 500 });
  }
}

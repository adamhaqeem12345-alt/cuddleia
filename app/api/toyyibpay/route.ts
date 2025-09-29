
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
    // Manually building the x-www-form-urlencoded string.
    const body = new URLSearchParams({
      userSecretKey: TOYYIBPAY_SECRET,
      categoryCode: TOYYIBPAY_CATEGORY_CODE,
      billName: 'Cuddleia Test Order',
      billDescription: 'A hardcoded test payment',
      billPrice: '100', // Represents RM1.00
      billAmount: '100', // Represents RM1.00
      billReturnUrl: 'https://www.cuddleia.com/cart',
      billCallbackUrl: 'https://www.cuddleia.com/api/webhook/toyyibpay',
      billTo: 'Test Customer',
      billEmail: 'test@example.com',
      billPhone: '0123456789',
    });

    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    // Check if the response is not ok
    if (!response.ok) {
        const errorText = await response.text();
        console.error('ToyyibPay API Error Response Text:', errorText);
        return NextResponse.json({ error: `ToyyibPay API returned an error: ${response.statusText}. Response: ${errorText}` }, { status: 500 });
    }

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

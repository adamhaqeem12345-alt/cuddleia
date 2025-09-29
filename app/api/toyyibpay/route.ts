
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

// This is your actual account secret key for creating bills.
const TOYYIBPAY_SECRET = 'rx6j88vd-eye6-g5xf-s91k-a4c616556wpr'; 
// This is your category code.
const TOYYIBPAY_CATEGORY_CODE = 'j0tzqhka';
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: Product[] = body.items;
    const total: number = body.total;

    if (!items || !total) {
      return NextResponse.json({ error: 'Missing items or total in request' }, { status: 400 });
    }

    const billName = 'Cuddleia Store Purchase';
    const billDescription = items.map(item => item.name).join(', ');
    const billAmountInCents = Math.round(total * 100);

    const params = new URLSearchParams({
      // CRITICAL FIX: The parameter for creating a bill is 'secretKey', not 'userSecretKey'.
      secretKey: TOYYIBPAY_SECRET,
      categoryCode: TOYYIBPAY_CATEGORY_CODE,
      billName: billName,
      billDescription: billDescription,
      billPrice: billAmountInCents.toString(),
      billAmount: billAmountInCents.toString(),
      billReturnUrl: 'https://www.cuddleia.com/cart', // Production Return URL
      billCallbackUrl: 'https://www.cuddleia.com/api/webhook/toyyibpay', // Production Callback URL
      billTo: 'Customer', // Using generic 'Customer'
      billEmail: 'customer@example.com', // Using generic email
      billPhone: '0123456789', // Using generic phone
    });

    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Check if the response from ToyyibPay is not a 200 OK.
    if (!response.ok) {
        const errorText = await response.text();
        console.error('ToyyibPay API Error Response Text:', errorText);
        return NextResponse.json({ error: `ToyyibPay API returned a non-200 status: ${response.status}. Response: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    
    // Check for the BillCode in the successful response
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = TOYYIBPAY_BILL_URL + billCode;
      return NextResponse.json({ paymentUrl });
    } else {
      // If the response is 200 OK but doesn't contain a BillCode, it's an API-level error.
      console.error('ToyyibPay API Error (but 200 OK):', data);
      const errorMessage = data && Array.isArray(data) && data.length > 0 && (data[0].msg || data[0].status) ? (data[0].msg || data[0].status) : 'Unknown API error, response did not contain BillCode.';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    return NextResponse.json({ error: 'There was an issue connecting to our payment provider.' }, { status: 500 });
  }
}

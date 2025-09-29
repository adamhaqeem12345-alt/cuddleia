
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

// This is your actual account secret key for creating bills.
const TOYYIBPAY_SECRET = 'rx6j88vd-eye6-g5xf-s91k-a4c616556wpr';
// This is your category code.
const TOYYIBPAY_CATEGORY_CODE = '43cm97xz';
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: Product[] = body.items;
    const total: number = body.total; // Total is expected in MYR

    if (!items || !total) {
      return NextResponse.json({ error: 'Missing items or total in request' }, { status: 400 });
    }

    const billName = 'Cuddleia Store Purchase';
    const billDescription = items.map(item => item.name).join(', ').substring(0, 100);
    const billAmountInCents = Math.round(total * 100);

    const params = new URLSearchParams({
      userSecretKey: TOYYIBPAY_SECRET,
      categoryCode: TOYYIBPAY_CATEGORY_CODE,
      billName: billName,
      billDescription: billDescription,
      billPriceSetting: '1',
      billPayorInfo: '1',
      billAmount: billAmountInCents.toString(),
      billReturnUrl: 'https://www.cuddleia.com/cart', // Production Return URL
      billCallbackUrl: 'https://www.cuddleia.com/api/webhook/toyyibpay', // Production Callback URL
      billTo: 'Customer',
      billEmail: 'customer@example.com',
      billPhone: '0123456789',
      billPaymentChannel: '0',
    });

    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
        console.error('ToyyibPay API Error (Non-200 Status):', response.status, responseText);
        return NextResponse.json({ error: `ToyyibPay API returned status ${response.status}. Response: ${responseText}` }, { status: 500 });
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch(e) {
        console.error('Failed to parse ToyyibPay JSON response:', responseText);
        return NextResponse.json({ error: 'Received an invalid response from ToyyibPay.'}, { status: 500 });
    }
    
    // According to docs, success is an array with a BillCode object.
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = TOYYIBPAY_BILL_URL + billCode;
      return NextResponse.json({ paymentUrl });
    } else {
      // If the response is 200 OK but doesn't contain a BillCode, it's an API-level error.
      console.error('ToyyibPay API Error (but 200 OK):', data);
      const errorMessage = data && data.length > 0 && (data[0].msg || data[0].status) ? (data[0].msg || data[0].status) : 'Unknown API error, response did not contain BillCode.';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `There was an issue connecting to our payment provider: ${errorMessage}` }, { status: 500 });
  }
}

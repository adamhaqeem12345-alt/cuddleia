
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';
import { v4 as uuidv4 } from 'uuid';


// IMPORTANT: The secret key and category code should be stored as environment variables
// for better security, e.g., process.env.TOYYIBPAY_SECRET
const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET;
const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE;

if (!TOYYIBPAY_SECRET || !TOYYIBPAY_CATEGORY_CODE) {
    console.error('Missing ToyyibPay credentials in environment variables.');
}

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
    
    if (!TOYYIBPAY_SECRET || !TOYYIBPAY_CATEGORY_CODE) {
        return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 500 });
    }
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const billName = 'Cuddleia Store Purchase';
    const billDescription = items.map(item => item.name).join(', ').substring(0, 100);
    const billAmountInCents = Math.round(total * 100);
    
    // In a real application with a database, you would create an order record here
    // and use its unique ID as the billExternalReferenceNo.
    const orderId = uuidv4();

    const params = new URLSearchParams({
      userSecretKey: TOYYIBPAY_SECRET,
      categoryCode: TOYYIBPAY_CATEGORY_CODE,
      billName: billName,
      billDescription: billDescription,
      billPriceSetting: '1',
      billPayorInfo: '1',
      billAmount: billAmountInCents.toString(),
      billReturnUrl: `${appUrl}/cart`,
      billCallbackUrl: `${appUrl}/api/webhook/toyyibpay`,
      billExternalReferenceNo: orderId,
      billTo: 'Customer', // These can be generic since billPayorInfo is 1
      billEmail: '',
      billPhone: '',
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

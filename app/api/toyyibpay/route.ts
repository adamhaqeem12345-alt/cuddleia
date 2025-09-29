
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: NextRequest) {
  // Read environment variables inside the function to ensure they are available at runtime.
  const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET;
  const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE;

  if (!TOYYIBPAY_SECRET || !TOYYIBPAY_CATEGORY_CODE) {
    console.error('CRITICAL: Missing ToyyibPay secret key or category code in environment variables.');
    return NextResponse.json({ error: 'Payment provider is not configured. Please contact support.' }, { status: 500 });
  }
    
  try {
    const body = await req.json();
    const items: Product[] = body.items;
    const total: number = body.total; // Total is expected in MYR

    if (!items || !total) {
      return NextResponse.json({ error: 'Missing items or total in request' }, { status: 400 });
    }
    
    // ===================================================================================
    // CRITICAL URL CONFIGURATION
    // ===================================================================================
    // ToyyibPay's API does NOT allow `localhost` in the callback or return URLs.
    // For local testing, you can use a placeholder like "https://example.com".
    // BEFORE GOING LIVE, you MUST replace these with your real production URLs.
    // ===================================================================================
    const returnUrl = 'https://www.cuddleia.com/cart'; // Replace with your live site's cart/success page
    const callbackUrl = 'https://www.cuddleia.com/api/webhook/toyyibpay'; // Replace with your live site's webhook URL
    
    // Create a unique reference for this order. In a real app, this would be your internal order ID.
    const orderId = uuidv4();
    
    // Ensure billName and billDescription adhere to character limits to prevent API errors.
    const billName = `Cuddleia Order ${orderId.substring(0, 8)}`;
    const billDescription = 'Your digital goods from Cuddleia.';
    const billAmountInCents = Math.round(total * 100);

    const params = new URLSearchParams({
      userSecretKey: TOYYIBPAY_SECRET,
      categoryCode: TOYYIBPAY_CATEGORY_CODE,
      billName: billName,
      billDescription: billDescription,
      billPriceSetting: '1',
      billPayorInfo: '0', // Creates an "open bill" where ToyyibPay collects customer info. This is the simplest and most reliable method.
      billAmount: billAmountInCents.toString(),
      billReturnUrl: returnUrl,
      billCallbackUrl: callbackUrl,
      billExternalReferenceNo: orderId,
      billPaymentChannel: '0', // 0 for FPX Only
    });

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
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
      const paymentUrl = 'https://toyyibpay.com/' + billCode;
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

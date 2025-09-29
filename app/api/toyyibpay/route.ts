
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

// These should be in environment variables, but are hardcoded for now
const TOYYIBPAY_SECRET = 'rx6j88vd-eye6-g5xf-s91k-a4c616556wpr';
const TOYYIBPAY_CATEGORY_CODE = '43cm97xz';
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: Product[] = body.items || [];
    const total = parseFloat(body.total || '0');
    
    // Placeholder customer details
    const customerName = 'Customer Name'; 
    const customerEmail = 'customer@example.com'; 

    if (!items || items.length === 0 || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ToyyibPay requires the amount in cents
    const amountInCents = Math.round(total * 100);
    const billDescription = `Payment for: ${items.map((item) => item.name).join(', ')}`;

    // Create the request body as URL-encoded form data, which is what ToyyibPay's API expects.
    const params = new URLSearchParams();
    params.append('userSecretKey', TOYYIBPAY_SECRET);
    params.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    params.append('billName', 'Cuddleia Order');
    params.append('billDescription', billDescription);
    params.append('billPrice', amountInCents.toString());
    params.append('billAmount', amountInCents.toString());
    params.append('billReturnUrl', 'https://www.cuddleia.com/cart');
    params.append('billCallbackUrl', 'https://www.cuddleia.com/api/webhook/toyyibpay');
    params.append('billTo', customerName);
    params.append('billEmail', customerEmail);
    params.append('billPhone', '0000000000'); // Placeholder phone

    // Make the server-to-server request to ToyyibPay
    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      body: params, // The browser/server fetch API automatically sets the correct 'Content-Type' header for URLSearchParams
    });
    
    const data = await response.json();
    
    // Check if the response from ToyyibPay is an array with a BillCode.
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = TOYYIBPAY_BILL_URL + billCode;
      return NextResponse.json({ paymentUrl });
    } else {
      // If the response structure is not as expected, log the error and respond.
      console.error('ToyyibPay API Error Response:', data);
      const errorMessage = data && Array.isArray(data) && data.length > 0 && data[0].msg ? data[0].msg : 'Unknown API error';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    return NextResponse.json({ error: 'There was an issue connecting to our payment provider.' }, { status: 500 });
  }
}

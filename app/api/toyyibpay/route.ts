
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

const TOYYIBPAY_SECRET = 'rx6j88vd-eye6-g5xf-s91k-a4c616556wpr';
const TOYYIBPAY_CATEGORY_CODE = '43cm97xz';
const TOYYIBPAY_API_URL = 'https://toyyibpay.com/index.php/api/createBill';
const TOYYIBPAY_BILL_URL = 'https://toyyibpay.com/';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: Product[] = body.items || [];
    const total = parseFloat(body.total || '0');
    const customerName = 'Customer Name'; // Placeholder
    const customerEmail = 'customer@example.com'; // Placeholder

    if (!items || items.length === 0 || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
    params.append('billReturnUrl', 'https://www.cuddleia.com/cart');
    params.append('billCallbackUrl', 'https://www.cuddleia.com/api/webhook/toyyibpay');
    params.append('billTo', customerName);
    params.append('billEmail', customerEmail);
    params.append('billPhone', '0000000000'); // Placeholder phone

    const response = await fetch(TOYYIBPAY_API_URL, {
      method: 'POST',
      body: params,
    });
    
    // The result from ToyyibPay is expected to be a JSON array.
    const data = await response.json();
    
    // Check if the response is an array with at least one element which has a BillCode.
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = TOYYIBPAY_BILL_URL + billCode;
      return NextResponse.json({ paymentUrl });
    } else {
      // If the structure is not as expected, log the error and respond.
      console.error('ToyyibPay API Error Response:', data);
      const errorMessage = data && Array.isArray(data) && data.length > 0 && data[0].msg ? data[0].msg : 'Unknown API error';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    return NextResponse.json({ error: 'There was an issue connecting to our payment provider.' }, { status: 500 });
  }
}

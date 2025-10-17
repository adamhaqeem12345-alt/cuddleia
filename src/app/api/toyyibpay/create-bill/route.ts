
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';
import { getConvertedAmount } from '@/app/actions';

interface CartItem extends Product {
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    if (!secretKey || !categoryCode) {
      console.error('Server configuration error: Missing ToyyibPay Secret Key or Category Code.');
      return NextResponse.json({ 
        error: 'Server configuration error. Please contact support.' 
      }, { status: 500 });
    }

    const { cart, name, email, phone } = (await req.json()) as { cart: CartItem[], name: string, email: string, phone: string };
    
    if (!cart || cart.length === 0) {
        return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }
    
    if (!name || !email || !phone) {
        return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 });
    }

    const totalAmountUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountMYR = await getConvertedAmount(totalAmountUSD);
    const totalAmountInSen = Math.round(totalAmountMYR * 100);

    if (totalAmountInSen < 100) { // ToyyibPay minimum is RM1.00
        return NextResponse.json({ error: 'Total amount must be at least RM1.00.' }, { status: 400 });
    }
    
    const toyyibpayUrl = 'https://toyyibpay.com/index.php/api/createBill';
    
    const bodyParams = new URLSearchParams({
      userSecretKey: secretKey,
      categoryCode: categoryCode,
      billName: 'Cuddleia Digital Goods',
      billDescription: `Your order from Cuddleia`,
      billPriceSetting: '1',
      billPayorInfo: '1',
      billAmount: totalAmountInSen.toString(),
      billReturnUrl: `${req.nextUrl.origin}/checkout/success`,
      billCallbackUrl: `${req.nextUrl.origin}/api/toyyibpay/callback`,
      billExternalReferenceNo: `order-${Date.now()}`,
      billTo: name,
      billEmail: email,
      billPhone: phone,
      billSplitPayment: '0',
      billSplitPaymentArgs: '',
      billPaymentChannel: '2', // 0: FPX, 1: Credit Card, 2: Both
      billContentEmail: 'Thank you for your purchase from Cuddleia! You will receive your download links shortly.',
      billChargeToCustomer: '1' // 1: Pass transaction charges to customer
    });

    const response = await fetch(toyyibpayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });
    
    const responseText = await response.text();

    if (!response.ok) {
        console.error('ToyyibPay API Error: Request failed with status', response.status, response.statusText);
        console.error('Raw Response:', responseText);
        throw new Error(`Failed to create ToyyibPay bill. API responded with status ${response.status}.`);
    }

    try {
        const data = JSON.parse(responseText);
        if (data && Array.isArray(data) && data[0] && data[0].BillCode) {
            const billCode = data[0].BillCode;
            const paymentUrl = `https://toyyibpay.com/${billCode}`;
            return NextResponse.json({ paymentUrl });
        } else {
            console.error('ToyyibPay API Error: Unexpected JSON structure.');
            console.error('Raw Response:', responseText);
            throw new Error('Failed to create ToyyibPay bill. The API returned an unexpected response format.');
        }
    } catch (e) {
        console.error('ToyyibPay API Error: Failed to parse JSON response.');
        console.error('Raw Response:', responseText);
        throw new Error('Failed to create ToyyibPay bill. The API returned a non-JSON or invalid response.');
    }

  } catch (error: any) {
    console.error('Create Bill Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

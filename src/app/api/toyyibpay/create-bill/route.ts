
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

const USD_TO_MYR_RATE = 4.7;

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    if (!secretKey || !categoryCode) {
      console.error('Server configuration error: Missing ToyyibPay Secret Key or Category Code.');
      return NextResponse.json({ 
        error: 'Server configuration error: Missing ToyyibPay credentials. Please contact support.' 
      }, { status: 500 });
    }

    const { cart, name, email } = (await req.json()) as { cart: CartItem[], name: string, email: string };
    
    if (!cart || cart.length === 0) {
        return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const totalAmountUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountMYR = totalAmountUSD * USD_TO_MYR_RATE;
    const totalAmountInSen = Math.round(totalAmountMYR * 100);

    if (totalAmountInSen <= 0) {
        return NextResponse.json({ error: 'Total amount must be greater than zero.' }, { status: 400 });
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
      billPhone: '',
      billSplitPayment: '0',
      billSplitPaymentArgs: '',
      billPaymentChannel: '2',
      billContentEmail: 'Thank you for your purchase from Cuddleia! You will receive your download links shortly.',
      billChargeToCustomer: '1'
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

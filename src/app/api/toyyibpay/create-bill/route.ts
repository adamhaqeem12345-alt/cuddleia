
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

async function getMyrRate(): Promise<number> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 } 
    });
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    const exchangeRate = data.rates.MYR;
    if (!exchangeRate) {
      throw new Error('MYR exchange rate not found');
    }
    return exchangeRate;
  } catch (error) {
    console.error('Exchange rate API failed:', error);
    // Fallback rate in case of API failure
    return 4.70; 
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cart, name, email } = (await req.json()) as { cart: CartItem[], name: string, email: string };

    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const apiEnv = process.env.TOYYIBPAY_API_ENV || 'dev';
    
    const toyyibpayUrl = apiEnv === 'live' 
        ? 'https://toyyibpay.com' 
        : 'https://dev.toyyibpay.com';

    if (!secretKey || !categoryCode) {
      throw new Error('ToyyibPay secret key or category code is not configured.');
    }

    if (!cart || cart.length === 0) {
        return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }
    
    const totalAmountUsd = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const myrRate = await getMyrRate();
    const totalAmountMyr = totalAmountUsd * myrRate;
    // ToyyibPay requires the amount in sen (integer).
    const totalAmountInSen = Math.round(totalAmountMyr * 100);
    
    const billName = 'Cuddleia Digital Goods';
    const billDescription = `Order from ${name}`;
    const returnUrl = `${req.nextUrl.origin}/checkout/success`;
    const callbackUrl = `${req.nextUrl.origin}/api/toyyibpay/callback`;

    // Rebuilding the request from scratch to exactly match the API documentation format.
    const params = new URLSearchParams();
    params.append('userSecretKey', secretKey);
    params.append('categoryCode', categoryCode);
    params.append('billName', billName);
    params.append('billDescription', billDescription);
    params.append('billPriceSetting', '1');
    params.append('billPayorInfo', '1');
    params.append('billAmount', totalAmountInSen.toString());
    params.append('billReturnUrl', returnUrl);
    params.append('billCallbackUrl', callbackUrl);
    params.append('billExternalReferenceNo', `order-${Date.now()}`);
    params.append('billTo', name);
    params.append('billEmail', email);
    params.append('billPhone', ''); // Mandatory field, even if empty.
    params.append('billSplitPayment', '0');
    params.append('billSplitPaymentArgs', '');
    params.append('billPaymentChannel', '0'); // '0' for FPX, '1' for Credit Card, '2' for both
    params.append('billContentEmail', 'Thank you for your purchase! You will receive another email with download links shortly.');
    params.append('billChargeToCustomer', '1');


    const response = await fetch(`${toyyibpayUrl}/index.php/api/createBill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    
    if (data && Array.isArray(data) && data[0] && data[0].BillCode) {
        const billCode = data[0].BillCode;
        const paymentUrl = `${toyyibpayUrl}/${billCode}`;
        return NextResponse.json({ paymentUrl });
    } else {
        console.error('ToyyibPay API Error:', data);
        throw new Error('Failed to create ToyyibPay bill. Please check server logs.');
    }

  } catch (error: any) {
    console.error('Create Bill Error:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

async function getConvertedAmount(usdAmount: number): Promise<number | null> {
  if (usdAmount === 0) {
    return 0;
  }
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 }
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const exchangeRate = data.rates.MYR;
    if (exchangeRate) {
      return usdAmount * exchangeRate;
    }
    return null;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    // --- START: CRITICAL VALIDATION ---
    if (!secretKey || !categoryCode) {
      console.error('Missing ToyyibPay environment variables. Please check your .env file.');
      return NextResponse.json({ 
        error: 'Server configuration error: ToyyibPay Secret Key or Category Code is missing. Please contact the site administrator.' 
      }, { status: 500 });
    }
    // --- END: CRITICAL VALIDATION ---

    const { cart, name, email } = (await req.json()) as { cart: CartItem[], name: string, email: string };

    const toyyibpayUrl = 'https://toyyibpay.com';

    if (!cart || cart.length === 0) {
        return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const totalAmountUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountMYR = await getConvertedAmount(totalAmountUSD);
    
    if (totalAmountMYR === null) {
        throw new Error('Failed to retrieve MYR conversion rate.');
    }
    
    const totalAmountInSen = Math.round(totalAmountMYR * 100);

    const bodyParams = new URLSearchParams();
    bodyParams.append('userSecretKey', secretKey);
    bodyParams.append('categoryCode', categoryCode);
    bodyParams.append('billName', 'Cuddleia Digital Goods');
    bodyParams.append('billDescription', `Order from ${name}`);
    bodyParams.append('billPriceSetting', '1');
    bodyParams.append('billPayorInfo', '1');
    bodyParams.append('billAmount', totalAmountInSen.toString());
    bodyParams.append('billReturnUrl', `${req.nextUrl.origin}/checkout/success`);
    bodyParams.append('billCallbackUrl', `${req.nextUrl.origin}/api/toyyibpay/callback`);
    bodyParams.append('billExternalReferenceNo', `order-${Date.now()}`);
    bodyParams.append('billTo', name);
    bodyParams.append('billEmail', email);
    bodyParams.append('billPhone', '');
    bodyParams.append('billSplitPayment', '0');
    bodyParams.append('billSplitPaymentArgs', '');
    bodyParams.append('billPaymentChannel', '0');
    bodyParams.append('billContentEmail', 'Thank you for your purchase! You will receive another email with download links shortly.');
    bodyParams.append('billChargeToCustomer', '1');

    const response = await fetch(`${toyyibpayUrl}/index.php/api/createBill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
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

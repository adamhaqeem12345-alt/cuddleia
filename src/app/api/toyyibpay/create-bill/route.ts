
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
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
    
    // --- TROUBLESHOOTING STEP: Hardcode the amount to match the documentation ---
    const totalAmountInSen = 100; // This is RM 1.00

    const params = new URLSearchParams();
    params.append('userSecretKey', secretKey);
    params.append('categoryCode', categoryCode);
    params.append('billName', 'Cuddleia Digital Goods');
    params.append('billDescription', `Order from ${name}`);
    params.append('billPriceSetting', '1');
    params.append('billPayorInfo', '1');
    params.append('billAmount', totalAmountInSen.toString());
    params.append('billReturnUrl', `${req.nextUrl.origin}/checkout/success`);
    params.append('billCallbackUrl', `${req.nextUrl.origin}/api/toyyibpay/callback`);
    params.append('billExternalReferenceNo', `order-${Date.now()}`);
    params.append('billTo', name);
    params.append('billEmail', email);
    params.append('billPhone', ''); // Keep this as per the sample's likely expectation
    params.append('billSplitPayment', '0');
    params.append('billSplitPaymentArgs', '');
    params.append('billPaymentChannel', '0');
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

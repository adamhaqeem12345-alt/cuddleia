
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';
import { getConvertedAmount } from '@/app/actions';
import { storeBillDetails } from '../callback/route';

interface CartItem extends Product {
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    if (!secretKey || !categoryCode) {
      console.error('Server configuration error: Missing TOYYIBPAY_SECRET_KEY or TOYYIBPAY_CATEGORY_CODE.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const { cart, name, email, phone, totalAmountUSD } = (await req.json()) as { cart: CartItem[], name: string, email: string, phone: string, totalAmountUSD: number };
    
    if (!cart || cart.length === 0 || !name || !email || !phone || totalAmountUSD === undefined) {
        return NextResponse.json({ error: 'Cart, user details, and total amount are required.' }, { status: 400 });
    }

    const totalAmountMYR = await getConvertedAmount(totalAmountUSD);
    const totalAmountInSen = Math.round(totalAmountMYR * 100);

    if (totalAmountInSen < 100) {
        return NextResponse.json({ error: 'Total amount must be at least RM1.00.' }, { status: 400 });
    }
    
    const toyyibpayUrl = 'https://toyyibpay.com/index.php/api/createBill';
    const externalReferenceNo = `order-${Date.now()}`;
    
    const bodyParams = new URLSearchParams({
      userSecretKey: secretKey,
      categoryCode: categoryCode,
      billName: 'Cuddleia Digital Goods',
      billDescription: `Your order from Cuddleia (${externalReferenceNo})`,
      billPriceSetting: '1',
      billPayorInfo: '1',
      billAmount: totalAmountInSen.toString(),
      billReturnUrl: `${req.nextUrl.origin}/api/toyyibpay/callback`,
      billCallbackUrl: `${req.nextUrl.origin}/api/toyyibpay/callback`,
      billExternalReferenceNo: externalReferenceNo,
      billTo: name,
      billEmail: email,
      billPhone: phone,
      billSplitPayment: '0',
      billSplitPaymentArgs: '',
      billPaymentChannel: '0',
      billContentEmail: 'Thank you for your purchase from Cuddleia! You will receive your download links shortly.',
      billChargeToCustomer: '1'
    });

    const response = await fetch(toyyibpayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });
    
    const data = await response.json();

    if (data && Array.isArray(data) && data[0] && data[0].BillCode) {
        const billCode = data[0].BillCode;

        // Store details for the webhook to use later
        storeBillDetails(billCode, { name, email, phone, cart, totalAmountInSen, totalAmountUSD });

        const paymentUrl = `https://toyyibpay.com/${billCode}`;
        return NextResponse.json({ paymentUrl });
    } else {
        console.error('ToyyibPay API Error:', data);
        throw new Error('Failed to create ToyyibPay bill. Unexpected response.');
    }

  } catch (error: any) {
    console.error('Create Bill Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

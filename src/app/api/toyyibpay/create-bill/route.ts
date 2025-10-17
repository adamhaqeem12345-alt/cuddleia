
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

// Using a fixed exchange rate to avoid external API failures.
const USD_TO_MYR_RATE = 4.7;

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    if (!secretKey || !categoryCode) {
      console.error('Missing ToyyibPay environment variables.');
      return NextResponse.json({ 
        error: 'Server configuration error: Missing ToyyibPay Secret Key or Category Code.' 
      }, { status: 500 });
    }

    const { cart, name, email } = (await req.json()) as { cart: CartItem[], name: string, email: string };

    const toyyibpayUrl = 'https://toyyibpay.com';

    if (!cart || cart.length === 0) {
        return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const totalAmountUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountMYR = totalAmountUSD * USD_TO_MYR_RATE;
    const totalAmountInSen = Math.round(totalAmountMYR * 100);

    if (totalAmountInSen <= 0) {
        return NextResponse.json({ error: 'Total amount must be greater than zero.' }, { status: 400 });
    }

    const bodyParams = new URLSearchParams({
      userSecretKey: secretKey,
      categoryCode: categoryCode,
      billName: 'Cuddleia Digital Goods',
      billDescription: `Order from ${name}`,
      billPriceSetting: '1',
      billPayorInfo: '1',
      billAmount: totalAmountInSen.toString(),
      billReturnUrl: `${req.nextUrl.origin}/checkout/success`,
      billCallbackUrl: `${req.nextUrl.origin}/api/toyyibpay/callback`,
      billExternalReferenceNo: `order-${Date.now()}`,
      billTo: name,
      billEmail: email,
      billPhone: '', // Included as per documentation sample
      billSplitPayment: '0',
      billSplitPaymentArgs: '',
      billPaymentChannel: '2', // 0 for FPX, 1 for Credit Card, 2 for both
      billContentEmail: 'Thank you for your purchase! You will receive another email with download links shortly.',
      billChargeToCustomer: '1',
    });

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

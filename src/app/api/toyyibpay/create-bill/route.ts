
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
    const { cart, name, email } = (await req.json()) as { cart: CartItem[], name: string, email: string };

    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    
    // Force production URL to avoid environment mismatch issues.
    const toyyibpayUrl = 'https://toyyibpay.com';

    if (!secretKey || !categoryCode) {
      throw new Error('ToyyibPay secret key or category code is not configured.');
    }

    if (!cart || cart.length === 0) {
        return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const totalAmountUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountMYR = await getConvertedAmount(totalAmountUSD);
    
    if (totalAmountMYR === null) {
        throw new Error('Failed to retrieve MYR conversion rate.');
    }
    
    const totalAmountInSen = Math.round(totalAmountMYR * 100);

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
        billPhone: '',
        billSplitPayment: '0',
        billSplitPaymentArgs: '',
        billPaymentChannel: '0',
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

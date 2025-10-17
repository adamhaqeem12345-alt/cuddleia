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
    
    // Calculate total amount in sen (MYR cents)
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountInSen = Math.round(totalAmount * 100);
    
    const billName = 'Cuddleia Digital Goods';
    const billDescription = `Order from ${name}`;

    const returnUrl = `${req.nextUrl.origin}/checkout/success`;
    const callbackUrl = `${req.nextUrl.origin}/api/toyyibpay/callback`;

    const params = new URLSearchParams();
    params.append('userSecretKey', secretKey);
    params.append('categoryCode', categoryCode);
    params.append('billName', billName);
    params.append('billDescription', billDescription);
    params.append('billPrice', totalAmountInSen.toString());
    params.append('billReturnUrl', returnUrl);
    params.append('billCallbackUrl', callbackUrl);
    params.append('billExternalReferenceNo', `order-${Date.now()}`);
    params.append('billTo', name);
    params.append('billEmail', email);

    const response = await fetch(`${toyyibpayUrl}/index.php/api/createBill`, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();
    
    if (data && data[0]?.BillCode) {
        const billCode = data[0].BillCode;
        const paymentUrl = `${toyyibpayUrl}/${billCode}`;
        return NextResponse.json({ paymentUrl });
    } else {
        // Log the actual error from ToyyibPay if available
        console.error('ToyyibPay API Error:', data);
        throw new Error('Failed to create ToyyibPay bill. Please check server logs.');
    }

  } catch (error: any) {
    console.error('Create Bill Error:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

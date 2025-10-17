
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

async function getMyrRate(): Promise<number> {
  // Using a reliable, key-less API.
  const response = await fetch('https://open.er-api.com/v6/latest/USD', {
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rate');
  }

  const data = await response.json();
  const exchangeRate = data.rates.MYR;

  if (!exchangeRate) {
    throw new Error('MYR exchange rate not found in API response');
  }

  return exchangeRate;
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
    
    // Calculate total amount in USD
    const totalAmountUsd = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Get the conversion rate and calculate MYR amount
    const myrRate = await getMyrRate();
    const totalAmountMyr = totalAmountUsd * myrRate;
    
    // Convert final MYR amount to sen (cents) for ToyyibPay
    // The amount must be an integer. Example: RM10.50 should be 1050.
    const totalAmountInSen = Math.round(totalAmountMyr * 100);
    
    const billName = 'Cuddleia Digital Goods';
    const billDescription = `Order from ${name}`;

    const returnUrl = `${req.nextUrl.origin}/checkout/success`;
    const callbackUrl = `${req.nextUrl.origin}/api/toyyibpay/callback`;

    // Use a FormData object to ensure correct content-type header and parameter encoding
    const formData = new FormData();
    formData.append('userSecretKey', secretKey);
    formData.append('categoryCode', categoryCode);
    formData.append('billName', billName);
    formData.append('billDescription', billDescription);
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', totalAmountInSen.toString());
    formData.append('billReturnUrl', returnUrl);
    formData.append('billCallbackUrl', callbackUrl);
    formData.append('billExternalReferenceNo', `order-${Date.now()}`);
    formData.append('billTo', name);
    formData.append('billEmail', email);
    formData.append('billPhone', ''); // Adding the missing billPhone parameter
    formData.append('billPaymentChannel', '0'); // Defaulting to 0 (FPX) for maximum compatibility

    const response = await fetch(`${toyyibpayUrl}/index.php/api/createBill`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    // The response is an array with a single object.
    if (data && Array.isArray(data) && data[0] && data[0].BillCode) {
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

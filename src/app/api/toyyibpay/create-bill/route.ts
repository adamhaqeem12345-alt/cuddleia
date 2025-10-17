
import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

// Using a fixed exchange rate to avoid external API failures and ensure a valid amount is always sent.
const USD_TO_MYR_RATE = 4.7;

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    // Add explicit checks for environment variables and return a clear error.
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
    
    // Construct the request body using URLSearchParams for correct x-www-form-urlencoded format.
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
      billPhone: '', // Included as it's in the sample, even if empty.
      billSplitPayment: '0',
      billSplitPaymentArgs: '',
      billPaymentChannel: '2', // 0 for FPX, 1 for Credit Card, 2 for both
      billContentEmail: 'Thank you for your purchase from Cuddleia! You will receive your download links shortly.',
      billChargeToCustomer: '1' // Charge transaction fee to customer
    });

    const response = await fetch(toyyibpayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });
    
    // The response from ToyyibPay is not JSON, it's a JSON string inside an array.
    const responseText = await response.text();
    const data = JSON.parse(responseText);

    if (data && Array.isArray(data) && data[0] && data[0].BillCode) {
        const billCode = data[0].BillCode;
        const paymentUrl = `https://toyyibpay.com/${billCode}`;
        return NextResponse.json({ paymentUrl });
    } else {
        console.error('ToyyibPay API Error. Raw Response:', responseText);
        // Provide a more helpful error message
        const errorMessage = data[0]?.Status === 'error' && data[0]?.Msg ? data[0].Msg : 'Failed to create ToyyibPay bill. The API returned an unexpected response.';
        throw new Error(errorMessage);
    }

  } catch (error: any) {
    console.error('Create Bill Endpoint Error:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

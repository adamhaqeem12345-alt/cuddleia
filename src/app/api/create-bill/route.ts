import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { billName, billDescription, billAmount, billTo, billEmail } = await request.json();

    const userSecretKey = process.env.TOYYIBPAY_USER_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const externalReferenceNo = uuidv4();

    const formData = new URLSearchParams();
    formData.append('userSecretKey', userSecretKey!);
    formData.append('categoryCode', categoryCode!);
    formData.append('billName', billName);
    formData.append('billDescription', billDescription);
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', billAmount);
    formData.append('billReturnUrl', `${process.env.NEXT_PUBLIC_URL}/products`);
    formData.append('billCallbackUrl', '');
    formData.append('billExternalReferenceNo', externalReferenceNo);
    formData.append('billTo', billTo);
    formData.append('billEmail', billEmail);
    formData.append('billPhone', ''); 

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();

    if (data && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = `https://toyyibpay.com/${billCode}`;
      return NextResponse.json({ paymentUrl });
    } else {
        console.error('ToyyibPay API Error:', data);
        return NextResponse.json({ message: 'Failed to create ToyyibPay bill', error: data }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating ToyyibPay bill:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

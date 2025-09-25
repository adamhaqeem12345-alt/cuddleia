
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { billName, billDescription, billAmount, billTo, billEmail } = await request.json();

    const userSecretKey = process.env.TOYYIBPAY_USER_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const externalReferenceNo = uuidv4();

    // Use URLSearchParams for x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('userSecretKey', userSecretKey!);
    formData.append('categoryCode', categoryCode!);
    formData.append('billName', billName);
    formData.append('billDescription', billDescription);
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', billAmount.toString());
    formData.append('billReturnUrl', '');
    formData.append('billExternalReferenceNo', externalReferenceNo);
    formData.append('billTo', billTo);
    formData.append('billEmail', billEmail);
    formData.append('billPhone', ''); 

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    });
    
    // The response from toyyibpay is an array with a single object on success
    if (!response.ok) {
        const errorText = await response.text();
        console.error('ToyyibPay API Error:', errorText);
        return NextResponse.json({ message: 'Failed to create ToyyibPay bill. The service returned an error.', error: errorText }, { status: response.status });
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = `https://toyyibpay.com/${billCode}`;
      return NextResponse.json({ paymentUrl });
    } else {
        // Log the actual error response from ToyyibPay
        console.error('ToyyibPay API Error (unexpected format):', data);
        return NextResponse.json({ message: 'Failed to create ToyyibPay bill due to unexpected response format.', error: data }, { status: 500 });
    }

  } catch (error)
   {
    console.error('Error creating ToyyibPay bill:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

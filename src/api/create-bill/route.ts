
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
    formData.append('billAmount', billAmount.toString());
    formData.append('billReturnUrl', '');
    formData.append('billCallbackUrl', '');
    formData.append('billExternalReferenceNo', externalReferenceNo);
    formData.append('billTo', billTo);
    formData.append('billEmail', billEmail);
    formData.append('billPhone', ''); 
    formData.append('billSplitPayment', '0');
    formData.append('billSplitPaymentArgs', '');
    formData.append('billPaymentChannel', '0');
    formData.append('billContentEmail', '');
    formData.append('billChargeToCustomer', '1');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const responseText = await response.text();

    if (!response.ok) {
        console.error('ToyyibPay API HTTP Error:', response.status, responseText);
        return NextResponse.json({ message: 'Failed to create ToyyibPay bill. The service returned an HTTP error.', error: responseText }, { status: response.status });
    }

    try {
        const data = JSON.parse(responseText);

        if (Array.isArray(data) && data.length > 0 && data[0].BillCode) {
          const billCode = data[0].BillCode;
          const paymentUrl = `https://toyyibpay.com/${billCode}`;
          return NextResponse.json({ paymentUrl });
        } else {
            console.error('ToyyibPay API Error (non-array response):', data);
            const errorMessage = data.msg || 'Failed to create bill due to unexpected response format.';
            return NextResponse.json({ message: errorMessage, error: data }, { status: 400 });
        }
    } catch(jsonError) {
        console.error('Failed to parse Toyyibpay JSON response:', jsonError);
        console.error('Toyyibpay raw response text:', responseText);
        return NextResponse.json({ message: 'Failed to parse Toyyibpay response. Check server logs for the raw response from the gateway.', error: responseText }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Internal server error in create-bill:', error);
    return NextResponse.json({ message: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

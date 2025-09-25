
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { billName, billDescription, billAmount, billTo, billEmail, returnUrl } = await request.json();

    const userSecretKey = process.env.TOYYIBPAY_USER_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    
    if (!userSecretKey || !categoryCode) {
        console.error("ToyyibPay environment variables (TOYYIBPAY_USER_SECRET_KEY, TOYYIBPAY_CATEGORY_CODE) are not set in .env.local");
        return NextResponse.json({ message: 'Server configuration error. Please contact support.' }, { status: 500 });
    }

    const externalReferenceNo = uuidv4();
    
    const successUrl = returnUrl ? `${returnUrl}?status=success` : '';

    const billData = {
        userSecretKey: userSecretKey,
        categoryCode: categoryCode,
        billName: billName,
        billDescription: billDescription,
        billPriceSetting: '1',
        billPayorInfo: '1',
        billAmount: Math.round(billAmount).toString(),
        billReturnUrl: successUrl,
        billCallbackUrl: '',
        billExternalReferenceNo: externalReferenceNo,
        billTo: billTo,
        billEmail: billEmail,
        billPhone: '', 
        billSplitPayment: '0',
        billSplitPaymentArgs: '',
        billPaymentChannel: '0',
        billContentEmail: '',
        billChargeToCustomer: '1',
    };

    // Manual construction of x-www-form-urlencoded string
    const bodyString = Object.entries(billData)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyString,
    });
    
    const responseText = await response.text();

    if (!response.ok) {
        console.error('ToyyibPay API HTTP Error:', response.status, responseText);
        return NextResponse.json({ message: `Failed to create ToyyibPay bill. The gateway returned an HTTP error: ${response.status}.`, error: responseText }, { status: response.status });
    }

    try {
        const data = JSON.parse(responseText);

        if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0];
            // SUCCESS Case: The first item in the array has a BillCode.
            if (firstItem && firstItem.BillCode) {
                const billCode = firstItem.BillCode;
                const paymentUrl = `https://toyyibpay.com/${billCode}`;
                return NextResponse.json({ paymentUrl });
            } 
            // ERROR Case: The first item in the array has a 'msg' field.
            else if (firstItem && firstItem.msg) {
                const errorMessage = firstItem.msg;
                console.error('ToyyibPay API Logic Error:', responseText);
                return NextResponse.json({ message: `ToyyibPay Error: ${errorMessage}`, error: data }, { status: 400 });
            }
        }
        
        // UNKNOWN Case: The response is JSON but not in a format we expect.
        console.error('ToyyibPay API Unknown JSON format:', responseText);
        return NextResponse.json({ message: 'Failed to create ToyyibPay bill due to unexpected response format.', error: data }, { status: 500 });

    } catch(jsonError) {
        // CATCH-ALL: The response from ToyyibPay was not valid JSON at all (e.g., an HTML error page).
        console.error('Failed to parse Toyyibpay JSON response:', jsonError);
        console.error('Toyyibpay raw response text:', responseText);
        return NextResponse.json({ message: 'The payment gateway returned an unexpected response. Please check server logs for details.', error: responseText }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Internal server error in create-bill:', error);
    return NextResponse.json({ message: 'An internal server error occurred: ' + error.message }, { status: 500 });
  }
}

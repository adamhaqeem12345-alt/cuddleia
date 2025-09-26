
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, total, products } = body;

    const toyyibpaySecretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const toyyibpayCategoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    
    if (!toyyibpaySecretKey || !toyyibpayCategoryCode) {
      throw new Error('ToyyibPay environment variables are not set');
    }

    const billPayload = {
      'userSecretKey': toyyibpaySecretKey,
      'categoryCode': toyyibpayCategoryCode,
      'billName': 'Cuddleia Order',
      'billDescription': `Payment for order from ${customerName}`,
      'billPriceSetting': 1,
      'billPayorInfo': 1,
      'billAmount': Math.round(total * 100),
      'billReturnUrl': `${process.env.NEXT_PUBLIC_URL}/thank-you?status=success`,
      'billCallbackUrl': `${process.env.NEXT_PUBLIC_URL}/api/payment-callback`,
      'billExternalReferenceNo': `cuddleia-${uuidv4()}`,
      'billTo': customerName,
      'billEmail': customerEmail,
      'billPhone': '0000000000', // Placeholder
    };

    const toyyibpayResponse = await fetch('https://dev.toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(billPayload as any),
    });

    if (!toyyibpayResponse.ok) {
        const errorText = await toyyibpayResponse.text();
        console.error('ToyyibPay API Error:', errorText);
        throw new Error(`Failed to create ToyyibPay bill. Status: ${toyyibpayResponse.status}`);
    }
    
    const responseData = await toyyibpayResponse.json();

    if (responseData && responseData.length > 0 && responseData[0].BillCode) {
        const billCode = responseData[0].BillCode;
        
        // Send email confirmation
        await sendOrderConfirmationEmail({
            customerName,
            customerEmail,
            total,
            products,
            orderId: billPayload.billExternalReferenceNo
        });

        return NextResponse.json({ billUrl: `https://dev.toyyibpay.com/${billCode}` });
    } else {
        console.error('Unexpected response from ToyyibPay:', responseData);
        throw new Error('Failed to retrieve BillCode from ToyyibPay');
    }

  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

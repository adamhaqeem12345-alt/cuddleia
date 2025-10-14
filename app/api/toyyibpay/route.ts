
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';

const TOYYIBPAY_USER_SECRET_KEY = process.env.TOYYIBPAY_SECRET_KEY;
const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface RequestBody {
    customerName: string;
    customerEmail: string;
    items: Product[];
    orderId: string;
}

export async function POST(req: NextRequest) {
    if (!TOYYIBPAY_USER_SECRET_KEY || !TOYYIBPAY_CATEGORY_CODE) {
        console.error('[ToyyibPay] CRITICAL: Missing ToyyibPay credentials in environment variables.');
        return NextResponse.json({ error: 'Payment provider not configured.' }, { status: 500 });
    }

    try {
        const body: RequestBody = await req.json();
        const { customerName, customerEmail, items, orderId } = body;

        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

        // ToyyibPay requires amount in cents
        const amountInCents = Math.round(totalAmount * 100);

        const productDescription = items.map(item => item.name).join(', ');

        const params = new URLSearchParams();
        params.append('userSecretKey', TOYYIBPAY_USER_SECRET_KEY);
        params.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
        params.append('billName', 'Cuddleia Digital Goods');
        params.append('billDescription', `Order for ${productDescription}`);
        params.append('billPriceSetting', '1');
        params.append('billPayorInfo', '1');
        params.append('billAmount', String(amountInCents));
        params.append('billReturnUrl', `${APP_URL}/checkout/success`);
        params.append('billCallbackUrl', `${APP_URL}/api/webhook/toyyibpay`);
        params.append('billExternalReferenceNo', orderId);
        params.append('billTo', customerName);
        params.append('billEmail', customerEmail);
        params.append('billPhone', '0123456789'); // A dummy phone number is required by ToyyibPay
        params.append('billSplitPayment', '0');
        params.append('billSplitPaymentArgs', '');
        params.append('billPaymentChannel', '0'); // 0 for FPX, 1 for Credit Card
        params.append('billContentEmail', 'Thank you for your purchase!');
        params.append('billChargeToCustomer', '1'); // 1 to pass transaction charge to customer

        const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const toyyibpayResponse = await response.json();

        if (toyyibpayResponse && toyyibpayResponse[0]?.BillCode) {
            const billCode = toyyibpayResponse[0].BillCode;
            const paymentUrl = `https://toyyibpay.com/${billCode}`;
            return NextResponse.json({ paymentUrl });
        } else {
            console.error('[ToyyibPay] Failed to create bill:', toyyibpayResponse);
            throw new Error('Could not create payment session with ToyyibPay.');
        }
    } catch (error) {
        console.error('[ToyyibPay] Error creating bill:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

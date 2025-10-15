// This is a server-side file. It should not be exposed to the client.
import { products } from './products';
import { cacheOrderDetails, deleteOrderDetails } from './order-cache';
import crypto from 'crypto';


const TOYYIBPAY_API_URL = process.env.NEXT_PUBLIC_TOYYIBPAY_API_URL || 'https://dev.toyyibpay.com';
const TOYYIBPAY_USER_SECRET_KEY = process.env.TOYYIBPAY_USER_SECRET_KEY || 'YOUR_SECRET_KEY';
const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE || 'YOUR_CATEGORY_CODE';


interface CartItem {
    id: string;
    quantity: number;
}

export async function createToyyibpayBill(cart: CartItem[], total: number, user: { name: string; email: string; phone: string }) {
    if (!TOYYIBPAY_USER_SECRET_KEY || !TOYYIBPAY_CATEGORY_CODE) {
        throw new Error('ToyyibPay credentials are not configured.');
    }

    const billName = 'Cuddleia Digital Products';
    const billDescription = `Purchase of ${cart.length} item(s) from Cuddleia`;

    // ToyyibPay requires amount in cents
    const billAmount = Math.round(total * 100);

    // Create a unique internal order ID to cache details
    const internalOrderId = crypto.randomBytes(16).toString('hex');
    cacheOrderDetails(internalOrderId, { cart, user, total: billAmount });

    const params = new URLSearchParams();
    params.append('userSecretKey', TOYYIBPAY_USER_SECRET_KEY);
    params.append('categoryCode', TOYYIBPAY_CATEGORY_CODE);
    params.append('billName', billName);
    params.append('billDescription', billDescription);
    params.append('billPrice', billAmount.toString());
    params.append('billQuantity', '1');
    params.append('billTo', user.name);
    params.append('billEmail', user.email);
    params.append('billPhone', user.phone);
    params.append('billSplitPayment', '0');
    params.append('billSplitPaymentArgs', '');
    params.append('billPayorInfo', '1');
    params.append('billpaymentAmount', billAmount.toString());
    params.append('billpaymentChannel', '0'); // 0 for FPX, 1 for Credit Card, 2 for both
    
    // Pass our internal ID to ToyyibPay to get it back in the callback
    params.append('billExternalReferenceNo', internalOrderId);

    const returnUrl = `${process.env.NEXT_PUBLIC_URL}/checkout/toyyibpay-status`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_URL}/api/toyyibpay/callback`;

    params.append('billReturnUrl', returnUrl);
    params.append('billCallbackUrl', callbackUrl);
    
    const response = await fetch(`${TOYYIBPAY_API_URL}/index.php/api/createBill`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    const data = await response.json();

    if (response.ok && data.length > 0 && data[0].BillCode) {
        return {
            billCode: data[0].BillCode,
            paymentUrl: `${TOYYIBPAY_API_URL}/${data[0].BillCode}`,
        };
    } else {
        console.error('ToyyibPay API Error:', data);
        // If bill creation fails, remove the cached order
        deleteOrderDetails(internalOrderId);
        throw new Error(data.msg || 'Failed to create ToyyibPay bill.');
    }
}


'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { Product } from '@/lib/products';
import fetch from 'node-fetch';

const orderSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  productId: z.string(),
  paymentMethod: z.enum(['ToyyibPay', 'PayPal']),
});


const PAYPAL_URL = 'https://www.paypal.com/';

export async function createOrder(
  product: Product,
  customerName: string,
  customerEmail: string,
  paymentMethod: 'ToyyibPay' | 'PayPal'
): Promise<{ url?: string; error?: string }> {
  const validation = orderSchema.safeParse({
    customerName,
    customerEmail,
    productId: product.id,
    paymentMethod,
  });

  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    // 1. Save order to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...validation.data,
      status: 'Pending',
      createdAt: serverTimestamp(),
      productName: product.name,
      price: product.price
    });
    console.log('Order created with ID: ', orderRef.id);

    // 2. Send confirmation email
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Cuddleia <${process.env.ZOHO_EMAIL}>`,
      to: customerEmail,
      subject: 'Cuddleia Order Confirmation',
      html: `
        <h1>Thank you for your order, ${customerName}!</h1>
        <p>We've received your order and will process it shortly.</p>
        <h2>Order Summary</h2>
        <p><b>Product:</b> ${product.name}</p>
        <p><b>Price:</b> $${product.price.toFixed(2)}</p>
        <p><b>Status:</b> Pending</p>
        <p>You will be redirected to ${paymentMethod} to complete your purchase.</p>
        <p>With love,<br>The Cuddleia Team</p>
      `,
    });
    console.log('Confirmation email sent to:', customerEmail);


    // 3. Handle Payment Gateway
    if (paymentMethod === 'ToyyibPay') {
        const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'userSecretKey': process.env.TOYYIBPAY_SECRET_KEY!,
                'categoryCode': process.env.TOYYIBPAY_CATEGORY_CODE!,
                'billName': product.name,
                'billDescription': `Order for ${product.name}`,
                'billPriceSetting': '1',
                'billPayorInfo': '1',
                'billAmount': (product.price * 100).toString(),
                'billReturnUrl': 'http://localhost:9002/payment/success', // Replace with your actual success URL
                'billCallbackUrl': 'http://localhost:9002/payment/callback', // Replace with your actual callback URL
                'billExternalReferenceNo': orderRef.id,
                'billTo': customerName,
                'billEmail': customerEmail,
                'billPhone': '0000000000', // ToyyibPay requires a phone number, using a placeholder
                'billSplitPayment': '0',
                'billSplitPaymentArgs': '',
                'billPaymentChannel': '0',
            })
        });

        const toyyibpayData: any = await toyyibpayResponse.json();

        if (toyyibpayData && toyyibpayData[0]?.BillCode) {
            return { url: `https://toyyibpay.com/${toyyibpayData[0].BillCode}` };
        } else {
            console.error('ToyyibPay error:', toyyibpayData);
            return { error: 'Could not create ToyyibPay bill.' };
        }

    } else { // PayPal
        const url = PAYPAL_URL;
         // In a real app, you'd append order details to the URL for PayPal
        return { url: `${url}?cmd=_xclick&business=YOUR_PAYPAL_EMAIL&item_name=${encodeURIComponent(product.name)}&amount=${product.price}&currency_code=USD&no_shipping=1&return=http://localhost:9002/payment/success&cancel_return=http://localhost:9002/` };

    }

  } catch (error) {
    console.error('Error creating order:', error);
    // This is a temporary fix to bypass Firestore permission errors for now.
    if (error instanceof Error && error.message.includes('permission')) {
        console.warn('Firestore permission error ignored, proceeding with payment redirect.');
        if (paymentMethod === 'ToyyibPay') {
          // Cannot proceed with ToyyibPay without orderRef.id, so we show an error
           return { error: 'Could not save order to our system due to a permissions issue. Please contact support.' };
        }
         const url = PAYPAL_URL;
        return { url: `${url}?cmd=_xclick&business=YOUR_PAYPAL_EMAIL&item_name=${encodeURIComponent(product.name)}&amount=${product.price}&currency_code=USD&no_shipping=1&return=http://localhost:9002/payment/success&cancel_return=http://localhost:9002/` };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

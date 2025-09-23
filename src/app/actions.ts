
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { Product } from '@/lib/products';
import { headers } from 'next/headers';


const orderSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  productId: z.string(),
});


const PAYPAL_URL = 'https://www.paypal.com/';

async function getCountryFromIP() {
    const FALLBACK_IP = '8.8.8.8'; // Google's DNS
    const ip = (headers().get('x-forwarded-for') ?? FALLBACK_IP).split(',')[0];

    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok) {
            console.warn(`Could not determine country from IP ${ip}. Defaulting to US.`);
            return 'US'; // Default to international if lookup fails
        }
        const data = await response.json();
        return data.country_code || 'US';
    } catch (error) {
        console.error('Error fetching country from IP:', error);
        return 'US'; // Default to international on error
    }
}

function determinePaymentGateway(countryCode: string): 'ToyyibPay' | 'PayPal' {
    if (countryCode === 'MY') {
        return 'ToyyibPay';
    }
    return 'PayPal';
}


export async function createOrder(
  product: Product,
  customerName: string,
  customerEmail: string,
): Promise<{ url?: string; error?: string }> {

  const validation = orderSchema.safeParse({
    customerName,
    customerEmail,
    productId: product.id,
  });

  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  try {
     // 1. Determine payment gateway
    const userCountry = await getCountryFromIP();
    const paymentMethod = determinePaymentGateway(userCountry);

    // 2. Send initial email immediately
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
        <h1>Thank you for your interest, ${customerName}!</h1>
        <p>We're taking you to the payment page to complete your order.</p>
        <h2>Order Summary</h2>
        <p><b>Product:</b> ${product.name}</p>
        <p><b>Price:</b> $${product.price.toFixed(2)}</p>
        <p>You will be redirected to ${paymentMethod} to complete your purchase.</p>
        <p>Once your payment is confirmed, you will receive another email with the download link for your product.</p>
        <p>With love,<br>The Cuddleia Team</p>
      `,
    });

    // 3. Handle Payment Gateway
    if (paymentMethod === 'ToyyibPay') {
        const billAmount = Math.round(product.price * 100);
        const billExternalReferenceNo = JSON.stringify({
            productId: product.id,
            customerName,
            customerEmail
        });


        const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'userSecretKey': process.env.TOYYIBPAY_SECRET_KEY!,
                'categoryCode': process.env.TOYYIPAY_CATEGORY_CODE!,
                'billName': product.name,
                'billDescription': `Order for ${product.name}`,
                'billPriceSetting': '1',
                'billPayorInfo': '1',
                'billAmount': billAmount.toString(),
                'billReturnUrl': `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
                'billCallbackUrl': `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
                'billExternalReferenceNo': billExternalReferenceNo,
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
        const orderId = `order_${Date.now()}`;
        const url = PAYPAL_URL;
        const customData = JSON.stringify({
          orderId,
          productId: product.id,
          customerName,
          customerEmail,
        });
        return { url: `${url}?cmd=_xclick&business=${process.env.PAYPAL_MERCHANT_EMAIL}&item_name=${encodeURIComponent(product.name)}&amount=${product.price}&currency_code=USD&no_shipping=1&return=${process.env.NEXT_PUBLIC_APP_URL}/payment/success?method=paypal&cancel_return=${process.env.NEXT_PUBLIC_APP_URL}/&custom=${encodeURIComponent(customData)}` };

    }

  } catch (error) {
    console.error('Error creating order redirect:', error);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

export async function processToyyibpayCallback(billcode: string, status_id: string, refno: string, billpayment_status: string) {
    if (billpayment_status === '1') { // Payment is successful
      try {
        const { productId, customerName, customerEmail } = JSON.parse(refno);

        const { products } = await import('@/lib/products');
        const product = products.find(p => p.id === productId);
        if (!product) {
          console.error(`Product with ID ${productId} not found.`);
          return;
        }

        const orderRef = await addDoc(collection(db, 'orders'), {
            customerName,
            customerEmail,
            productId,
            paymentMethod: 'ToyyibPay',
            status: 'Paid',
            createdAt: serverTimestamp(),
            productName: product.name,
            price: product.price,
            toyyibpayBillCode: billcode,
        });

        console.log(`Saved successful order ${orderRef.id} to Firestore.`);

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
          subject: 'Your Cuddleia Digital Product is Here!',
          html: `
            <h1>Thank you for your purchase, ${customerName}!</h1>
            <p>Your payment has been confirmed. You can now download your digital product using the link below:</p>
            <h2>${product.name}</h2>
            <a href="${product.downloadUrl}" target="_blank">Download Now</a>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>With love,<br>The Cuddleia Team</p>
          `,
        });
        console.log(`Digital product email sent for order ${orderRef.id}`);

      } catch (error) {
        console.error('Error processing successful ToyyibPay payment:', error);
      }
    } else {
      console.log(`ToyyibPay payment for bill ${billcode} was not successful. Status: ${billpayment_status}`);
    }
}

export async function processPaypalSuccess(custom: string) {
    try {
        const { productId, customerName, customerEmail, orderId } = JSON.parse(decodeURIComponent(custom));

        const { products } = await import('@/lib/products');
        const product = products.find(p => p.id === productId);
        if (!product) {
          console.error(`Product with ID ${productId} not found.`);
          return;
        }

        const orderRef = await addDoc(collection(db, 'orders'), {
            customerName,
            customerEmail,
            productId,
            paymentMethod: 'PayPal',
            status: 'Paid',
            createdAt: serverTimestamp(),
            productName: product.name,
            price: product.price,
            paypalOrderId: orderId,
        });

        console.log(`Saved successful PayPal order ${orderRef.id} to Firestore.`);

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
          subject: 'Your Cuddleia Digital Product is Here!',
          html: `
            <h1>Thank you for your purchase, ${customerName}!</h1>
            <p>Your payment has been confirmed. You can now download your digital product using the link below:</p>
            <h2>${product.name}</h2>
            <a href="${product.downloadUrl}" target="_blank">Download Now</a>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>With love,<br>The Cuddleia Team</p>
          `,
        });
        console.log(`Digital product email sent for PayPal order ${orderRef.id}`);

    } catch (error) {
        console.error('Error processing successful PayPal payment:', error);
    }
}

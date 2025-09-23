
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { Product, products } from '@/lib/products';
import { headers } from 'next/headers';


const orderSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  productId: z.string(),
});

function getAppUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        throw new Error("NEXT_PUBLIC_APP_URL is not set in the environment variables.");
    }
    return appUrl;
}

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
  productId: string,
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  
  const appUrl = getAppUrl();

  const product = products.find(p => p.id === productId);
  if (!product) {
      return { error: 'Product not found.' };
  }

  const validation = orderSchema.safeParse({
    customerName,
    customerEmail,
    productId: product.id,
  });

  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  let redirectUrl = '';

  try {
    const userCountry = await getCountryFromIP();
    const paymentMethod = determinePaymentGateway(userCountry);
    const orderId = `order_${Date.now()}`;

    // Send initial email immediately
    try {
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
    } catch (emailError) {
        console.error("Failed to send initial email:", emailError);
        // We can continue with the payment even if the email fails
    }

    if (paymentMethod === 'ToyyibPay') {
        const billAmount = Math.round(product.price * 100);
        const billExternalReferenceNo = `${orderId}|${product.id}|${customerName}|${customerEmail}`;


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
                'billReturnUrl': `${appUrl}/payment/success`,
                'billCallbackUrl': `${appUrl}/api/payment/callback`,
                'billExternalReferenceNo': billExternalReferenceNo,
                'billTo': customerName,
                'billEmail': customerEmail,
                'billPhone': '0000000000',
                'billSplitPayment': '0',
                'billSplitPaymentArgs': '',
                'billPaymentChannel': '0',
            })
        });

        const toyyibpayData: any = await toyyibpayResponse.json();

        if (toyyibpayData && toyyibpayData[0]?.BillCode) {
            redirectUrl = `https://toyyibpay.com/${toyyibpayData[0].BillCode}`;
        } else {
            console.error('ToyyibPay error:', toyyibpayData);
            return { error: 'Could not create ToyyibPay bill. Please contact support.' };
        }

    } else { // PayPal
        const customData = `${orderId}|${product.id}|${customerName}|${customerEmail}`;
        const paypalParams = new URLSearchParams({
            cmd: '_xclick',
            business: process.env.PAYPAL_MERCHANT_EMAIL!,
            item_name: product.name,
            amount: product.price.toFixed(2),
            currency_code: 'USD',
            no_shipping: '1',
            return: `${appUrl}/payment/success?method=paypal`,
            cancel_return: `${appUrl}/products/${product.id}?status=cancelled`,
            notify_url: `${appUrl}/api/payment/ipn`,
            custom: customData,
        });
        redirectUrl = `https://www.paypal.com/cgi-bin/webscr?${paypalParams.toString()}`;
    }
  } catch (error) {
    console.error('Error creating order redirect:', error);
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { error: errorMessage };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  } else {
    return { error: 'Could not generate payment link.' };
  }
}

async function fulfillOrder(orderId: string, customerName: string, customerEmail: string, productId: string, paymentMethod: string, transactionId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error(`[Fulfill] Product with ID ${productId} not found.`);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.log(`[Fulfill] Order ${orderId} already exists in Firestore. Skipping.`);
        return;
    }

    const orderRef = await addDoc(ordersRef, {
        customerName,
        customerEmail,
        productId,
        orderId,
        paymentMethod,
        status: 'Paid',
        createdAt: serverTimestamp(),
        productName: product.name,
        price: product.price,
        transactionId: transactionId,
    });
    console.log(`[Fulfill] Saved successful ${paymentMethod} order ${orderRef.id} to Firestore.`);

    try {
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
        console.log(`[Fulfill] Digital product email sent for order ${orderRef.id}`);
    } catch (emailError) {
        console.error(`[Fulfill] Error sending final email for order ${orderRef.id}:`, emailError);
    }
}


export async function processToyyibpayCallback(refno: string, billcode: string, status: string) {
    // status '1' means successful payment
    if (status === '1') { 
      try {
        const [orderId, productId, customerName, customerEmail] = refno.split('|');

        if (!orderId || !productId || !customerName || !customerEmail) {
          console.error(`[ToyyibPay Callback] Could not parse refno: ${refno}`);
          return;
        }
        await fulfillOrder(orderId, customerName, customerEmail, productId, 'ToyyibPay', billcode);
      } catch (error) {
        console.error('[ToyyibPay Callback] Error processing successful payment:', error);
      }
    } else {
      console.log(`[ToyyibPay Callback] Payment for bill ${billcode} was not successful. Status: ${status}`);
    }
}

export async function processPaypalIPN(ipnData: any) {
    try {
        console.log('[PayPal IPN] Received IPN data:', ipnData);

        if (ipnData.payment_status !== 'Completed') {
            console.log(`[PayPal IPN] Payment status is not 'Completed' (${ipnData.payment_status}). Skipping.`);
            return;
        }

        const custom = ipnData.custom;
        const [orderId, productId, customerName, customerEmail] = custom.split('|');

        if (!orderId || !productId || !customerName || !customerEmail) {
          console.error(`[PayPal IPN] Could not parse custom field: ${custom}`);
          return;
        }

        await fulfillOrder(orderId, customerName, customerEmail, productId, 'PayPal', ipnData.txn_id);

    } catch (error) {
        console.error('[PayPal IPN] Error processing IPN:', error);
    }
}
    
    

    
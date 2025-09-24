
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
          subject: `Your Cuddleia Order is Almost Complete!`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
              <h1 style="color: #d17b88; font-family: var(--font-belleza), sans-serif;">Almost there, ${customerName}!</h1>
              <p>Thank you for your interest. We're now redirecting you to a secure payment page to complete your order.</p>
              
              <div style="background-color: #fdf6f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #9d5c63; border-bottom: 2px solid #e6c2c7; padding-bottom: 10px; font-family: var(--font-belleza), sans-serif;">Order Summary</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold;">Product:</td>
                    <td style="padding: 10px 0;">${product.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold;">Price:</td>
                    <td style="padding: 10px 0;">$${product.price.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <p>You will be redirected to <strong>${paymentMethod}</strong> to finalize your purchase.</p>
              <p>Once your payment is confirmed, you will receive a separate email containing the download link for your product.</p>
              
              <p style="margin-top: 30px;">With love,<br><strong>The Cuddleia Team</strong></p>
            </div>
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
        const paypalUrl = process.env.PAYPAL_SANDBOX === 'true' 
            ? 'https://www.sandbox.paypal.com/cgi-bin/webscr'
            : 'https://www.paypal.com/cgi-bin/webscr';
        redirectUrl = `${paypalUrl}?${paypalParams.toString()}`;
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
          subject: `Your Cuddleia Digital Product is Here! (Order #${orderId})`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
              <h1 style="color: #d17b88; font-family: var(--font-belleza), sans-serif;">Thank you for your purchase, ${customerName}!</h1>
              <p>Your payment has been successfully confirmed. You can now access your digital product below.</p>
              
              <div style="background-color: #fdf6f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #9d5c63; border-bottom: 2px solid #e6c2c7; padding-bottom: 10px; font-family: var(--font-belleza), sans-serif;">Your Digital Product</h2>
                <div style="padding: 15px 0;">
                  <h3 style="margin: 0; color: #333;">${product.name}</h3>
                  <a href="${product.downloadUrl}" target="_blank" style="display: inline-block; background-color: #d17b88; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 25px; margin-top: 15px; font-weight: bold; text-align: center;">
                    Download Now
                  </a>
                </div>
              </div>

              <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
                <h3 style="color: #9d5c63; font-family: var(--font-belleza), sans-serif;">Order Details</h3>
                <table style="width: 100%; font-size: 14px; color: #555;">
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Order ID:</td>
                    <td style="padding: 5px 0;">${orderId}</td>
                  </tr>
                   <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Transaction ID:</td>
                    <td style="padding: 5px 0;">${transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Payment Method:</td>
                    <td style="padding: 5px 0;">${paymentMethod}</td>
                  </tr>
                </table>
              </div>

              <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email. We're here to help!</p>
              <p>With love,<br><strong>The Cuddleia Team</strong></p>
            </div>
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

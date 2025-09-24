
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { products, type Product } from '@/lib/products';
import { headers } from 'next/headers';
import type { CartItem } from '@/components/cart/cart-context';


const orderSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  cartItems: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
  })).min(1, "Your cart is empty."),
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
    let ip = (headers().get('x-forwarded-for') ?? FALLBACK_IP).split(',')[0].trim();
    
    // In development (localhost), x-forwarded-for might not be set.
    if (ip === '::1' || ip.startsWith('127.0.0.1')) {
        ip = FALLBACK_IP;
    }

    try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok) {
            console.warn(`Could not determine country from IP ${ip}. Response: ${response.status}. Defaulting to US.`);
            return 'US'; // Default to international if lookup fails
        }
        const data = await response.json();
        return data.country_code || 'US';
    } catch (error) {
        console.error('Error fetching country from IP:', error);
        return 'US'; // Default to international on error
    }
}

async function getUsdToMyrRate(): Promise<number> {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
            console.warn(`Could not fetch exchange rate. Defaulting to 4.7. Status: ${response.status}`);
            return 4.7; // Fallback rate
        }
        const data = await response.json();
        const rate = data.rates.MYR;
        if (!rate) {
            console.warn('MYR not found in exchange rate response. Defaulting to 4.7.');
            return 4.7; // Fallback rate
        }
        console.log(`Fetched USD to MYR exchange rate: ${rate}`);
        return rate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 4.7; // Fallback rate on error
    }
}


function determinePaymentGateway(countryCode: string): 'ToyyibPay' | 'PayPal' {
    if (countryCode === 'MY') {
        return 'ToyyibPay';
    }
    return 'PayPal';
}

export async function createOrder(
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const rawCartItems = formData.get('cartItems') as string;

  let cartItems: CartItem[];
  try {
    cartItems = JSON.parse(rawCartItems);
  } catch (e) {
    return { error: 'Invalid cart data.' };
  }
  
  const appUrl = getAppUrl();

  const validation = orderSchema.safeParse({
    customerName,
    customerEmail,
    cartItems,
  });

  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }

  // Calculate total and validate products
  let totalAmountUsd = 0;
  const validatedProducts: (Product & { quantity: number })[] = [];
  for (const item of cartItems) {
      const product = products.find(p => p.id === item.id);
      if (!product) {
          return { error: `Product with ID ${item.id} not found.` };
      }
      totalAmountUsd += product.price * item.quantity;
      validatedProducts.push({ ...product, quantity: item.quantity });
  }
  
  let redirectUrl = '';

  try {
    const userCountry = await getCountryFromIP();
    const paymentMethod = determinePaymentGateway(userCountry);
    const orderId = `order_${Date.now()}`;

    const productIds = cartItems.map(item => item.id).join(',');
    const orderDescription = validatedProducts.map(p => p.name).join(', ');

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
                <p>${orderDescription}</p>
                <p style="font-size: 1.2em; font-weight: bold; color: #333; margin-top: 10px;">Total: $${totalAmountUsd.toFixed(2)} USD</p>
              </div>
              
              <p>You will be redirected to <strong>${paymentMethod}</strong> to finalize your purchase.</p>
              <p>Once your payment is confirmed, you will receive a separate email containing the download links for your products.</p>
              
              <p style="margin-top: 30px;">With love,<br><strong>The Cuddleia Team</strong></p>
            </div>
          `,
        });
    } catch (emailError) {
        console.error("Failed to send initial email:", emailError);
        // We can continue with the payment even if the email fails
    }

    if (paymentMethod === 'ToyyibPay') {
        const usdToMyrRate = await getUsdToMyrRate();
        const totalAmountMyr = totalAmountUsd * usdToMyrRate;
        const billAmountInCents = Math.round(totalAmountMyr * 100);
        
        const billExternalReferenceNo = `${orderId}|${productIds}|${customerName}|${customerEmail}`;
        const billDescriptionWithCurrency = `${orderDescription} (Total: RM ${totalAmountMyr.toFixed(2)})`;

        const toyyibpayResponse = await fetch('https://toyyibpay.com/index.php/api/createBill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'userSecretKey': process.env.TOYYIBPAY_SECRET_KEY!,
                'categoryCode': process.env.TOYYIPAY_CATEGORY_CODE!,
                'billName': 'Cuddleia Order',
                'billDescription': billDescriptionWithCurrency,
                'billPriceSetting': '1',
                'billPayorInfo': '1',
                'billAmount': billAmountInCents.toString(),
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
        const customData = `${orderId}|${productIds}|${customerName}|${customerEmail}`;
        const paypalParams = new URLSearchParams({
            cmd: '_cart',
            upload: '1',
            business: process.env.PAYPAL_MERCHANT_EMAIL!,
            currency_code: 'USD',
            no_shipping: '1',
            return: `${appUrl}/payment/success?method=paypal`,
            cancel_return: `${appUrl}/checkout?status=cancelled`,
            notify_url: `${appUrl}/api/payment/ipn`,
            custom: customData,
        });

        validatedProducts.forEach((product, index) => {
            paypalParams.append(`item_name_${index + 1}`, product.name);
            paypalParams.append(`amount_${index + 1}`, product.price.toFixed(2));
            paypalParams.append(`quantity_${index + 1}`, product.quantity.toString());
        });

        // Default to the live environment unless PAYPAL_SANDBOX is explicitly 'true'
        const useSandbox = process.env.PAYPAL_SANDBOX === 'true';
        const paypalUrl = useSandbox
            ? 'https://www.paypal.com/sandbox/cgi-bin/webscr'
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

async function fulfillOrder(orderId: string, customerName: string, customerEmail: string, productIdsStr: string, paymentMethod: string, transactionId: string) {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.log(`[Fulfill] Order ${orderId} already exists in Firestore. Skipping.`);
        return;
    }

    const productIds = productIdsStr.split(',');
    const orderedProducts = products.filter(p => productIds.includes(p.id));

    if (orderedProducts.length === 0) {
      console.error(`[Fulfill] No valid products found for product IDs: ${productIdsStr}`);
      return;
    }

    const totalOrderPrice = orderedProducts.reduce((sum, p) => sum + p.price, 0);

    try {
        const orderRef = await addDoc(ordersRef, {
            customerName,
            customerEmail,
            productIds,
            orderId,
            paymentMethod,
            status: 'Paid',
            createdAt: serverTimestamp(),
            productNames: orderedProducts.map(p => p.name),
            price: totalOrderPrice,
            transactionId: transactionId,
        });
        console.log(`[Fulfill] Saved successful ${paymentMethod} order ${orderRef.id} to Firestore.`);
    } catch(dbError) {
        console.error(`[Fulfill-DB] Failed to save order ${orderId} to Firestore. Error:`, dbError);
        // Even if DB fails, we should still try to send the email.
    }


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

        const productDownloadsHtml = orderedProducts.map(product => `
            <div style="padding: 15px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${product.name}</h3>
                <a href="${product.downloadUrl}" target="_blank" style="display: inline-block; background-color: #d17b88; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-weight: bold; text-align: center;">
                Download Now
                </a>
            </div>
        `).join('');

        await transporter.sendMail({
          from: `Cuddleia <${process.env.ZOHO_EMAIL}>`,
          to: customerEmail,
          subject: `Your Cuddleia Digital Products are Here! (Order #${orderId})`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
              <h1 style="color: #d17b88; font-family: var(--font-belleza), sans-serif;">Thank you for your purchase, ${customerName}!</h1>
              <p>Your payment has been successfully confirmed. You can now access your digital products below.</p>
              
              <div style="background-color: #fdf6f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h2 style="color: #9d5c63; border-bottom: 2px solid #e6c2c7; padding-bottom: 10px; font-family: var(--font-belleza), sans-serif;">Your Digital Products</h2>
                ${productDownloadsHtml}
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
        console.log(`[Fulfill-Email] Digital product email sent for order ${orderId}`);
    } catch (emailError) {
        console.error(`[Fulfill-Email] Error sending final email for order ${orderId}:`, emailError);
    }
}


export async function processToyyibpayCallback(refno: string, billcode: string, status: string) {
    // status '1' means successful payment
    if (status === '1') { 
      try {
        console.log(`[ToyyibPay Callback] Processing successful payment for refno: ${refno}, billcode: ${billcode}`);
        const [orderId, productIds, customerName, customerEmail] = refno.split('|');

        if (!orderId || !productIds || !customerName || !customerEmail) {
          console.error(`[ToyyibPay Callback] Could not parse refno: ${refno}. Aborting fulfillment.`);
          return;
        }
        await fulfillOrder(orderId, customerName, customerEmail, productIds, 'ToyyibPay', billcode);
      } catch (error) {
        console.error('[ToyyibPay Callback] Error processing successful payment:', error);
      }
    } else {
      console.log(`[ToyyibPay Callback] Payment for bill ${billcode} was not successful. Status: ${status}`);
    }
}

export async function processPaypalIPN(ipnData: any) {
    try {
        console.log(`[PayPal IPN] Received IPN data. Verifying...`);
        console.log(`[PayPal IPN] Transaction ID: ${ipnData.txn_id}, Payment Status: ${ipnData.payment_status}`);


        if (ipnData.payment_status !== 'Completed') {
            console.log(`[PayPal IPN] Payment status is not 'Completed' (${ipnData.payment_status}) for txn_id ${ipnData.txn_id}. Skipping.`);
            return;
        }

        const custom = ipnData.custom;
        if (!custom) {
            console.error(`[PayPal IPN] Custom field is missing from IPN data for txn_id ${ipnData.txn_id}. Cannot fulfill order.`);
            return;
        }
        
        console.log(`[PayPal IPN] Custom field received: "${custom}"`);

        const [orderId, productIds, customerName, customerEmail] = custom.split('|');

        if (!orderId || !productIds || !customerName || !customerEmail) {
          console.error(`[PayPal IPN] Could not parse custom field: "${custom}" for txn_id ${ipnData.txn_id}. Aborting fulfillment.`);
          return;
        }
        
        console.log(`[PayPal IPN] Processing successful payment for order: ${orderId}`);
        await fulfillOrder(orderId, customerName, customerEmail, productIds, 'PayPal', ipnData.txn_id);

    } catch (error) {
        console.error('[PayPal IPN] Error processing IPN:', error);
    }
}

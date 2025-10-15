import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
import { getOrderDetails, deleteOrderDetails } from '@/lib/order-cache';
import { products } from '@/lib/products';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const billcode = formData.get('billcode') as string;
    const status_id = formData.get('status_id') as string;
    const order_id = formData.get('order_id') as string; // This is our internal order ID (cache key)
    const msg = formData.get('msg') as string;
    const transaction_id = formData.get('transaction_id') as string;
    const signature = formData.get('signature') as string;
    
    const TOYYIBPAY_USER_SECRET_KEY = process.env.TOYYIBPAY_USER_SECRET_KEY || 'YOUR_SECRET_KEY';

    const dataToSign = status_id + billcode + order_id + TOYYIBPAY_USER_SECRET_KEY;
    const generatedSignature = crypto.createHash('sha1').update(dataToSign).digest('hex');

    if (signature !== generatedSignature) {
      console.warn('Invalid signature received from ToyyibPay callback');
      // For security, stop processing if signature is invalid
      return new Response('Invalid signature', { status: 400 });
    }
    
    // status_id: 1 = success, 2 = pending, 3 = fail
    if (status_id === '1') {
        // Payment is successful, send email
        const cachedOrder = getOrderDetails(order_id);
        
        if (cachedOrder) {
            const customer = {
                name: cachedOrder.user.name,
                email: cachedOrder.user.email,
            };
            const orderDetails = {
                orderId: billcode, // Use the billcode as the public order ID
                total: `MYR ${(cachedOrder.total / 100).toFixed(2)}`,
                paymentMethod: 'ToyyibPay/FPX',
                items: cachedOrder.cart.map((cartItem: any) => {
                    const product = products.find(p => p.id === cartItem.id);
                    return {
                        id: cartItem.id,
                        name: product?.name || 'Unknown Product',
                        quantity: cartItem.quantity,
                        downloadUrl: product?.downloadUrl,
                    };
                })
            };

            // Using .catch to not block the response
            sendPurchaseConfirmationEmail(customer, orderDetails).catch(emailError => {
                 console.error("Failed to send purchase email after ToyyibPay callback:", emailError);
            });
            
            // Log to Google Sheets
            const productNames = orderDetails.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            appendToSheet({
                date: new Date().toISOString(),
                name: customer.name,
                email: customer.email,
                product: productNames,
                total: orderDetails.total,
                paymentMethod: orderDetails.paymentMethod,
            }).catch(sheetError => {
                console.error("Failed to log to Google Sheets after ToyyibPay callback:", sheetError);
            });

            // Clean up the cached order details after processing
            deleteOrderDetails(order_id);

        } else {
            console.error(`Could not find cached order details for ToyyibPay order_id: ${order_id}`);
        }
    } else {
        // For failed or pending payments, just clean up if they exist.
        if (getOrderDetails(order_id)) {
            deleteOrderDetails(order_id);
        }
    }
    
    // ToyyibPay expects an empty response with status 200 OK
    return new Response(null, { status: 200 });

  } catch (error: any) {
    console.error("ToyyibPay Callback Error:", error);
    return new Response('Error processing callback', { status: 500 });
  }
}

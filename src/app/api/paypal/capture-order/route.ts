import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
import { products } from '@/lib/products';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const { json: captureData, httpStatusCode } = await captureOrder(orderID);

    if (httpStatusCode === 201 && captureData.status === 'COMPLETED') {
        const purchaseUnit = captureData.purchase_units[0];
        const customer = {
            name: captureData.payer.name.given_name,
            email: captureData.payer.email_address,
        };
        const orderDetails = {
            orderId: captureData.id,
            total: `${purchaseUnit.amount.value} ${purchaseUnit.amount.currency_code}`,
            paymentMethod: 'PayPal',
            items: purchaseUnit.items.map((item: any) => {
                const product = products.find(p => p.id === item.sku);
                return {
                    id: item.sku,
                    name: item.name,
                    quantity: parseInt(item.quantity),
                    downloadUrl: product?.downloadUrl
                };
            })
        };

        // This can run in parallel, no need to await
        sendPurchaseConfirmationEmail(customer, orderDetails).catch(emailError => {
            console.error("Failed to send purchase email after PayPal capture:", emailError);
        });

        // Log to Google Sheets, can also run in parallel
        const productNames = orderDetails.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
        appendToSheet({
            date: new Date().toISOString(),
            name: customer.name,
            email: customer.email,
            product: productNames,
            total: orderDetails.total,
            paymentMethod: orderDetails.paymentMethod,
        }).catch(sheetError => {
            console.error("Failed to log to Google Sheets after PayPal capture:", sheetError);
        });
    }


    return NextResponse.json(captureData, { status: httpStatusCode });
  } catch (error: any) {
    console.error("Failed to capture order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

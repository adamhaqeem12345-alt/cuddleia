
import { NextResponse } from 'next/server';
import { verifyWebhookSignature, captureOrder, getOrderDetails } from '@/lib/paypal-api';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { products as allProducts } from '@/lib/products';
import type { ProductInfo } from '@/lib/email';

export async function POST(req: Request) {
    // Clone the request to be able to read the body twice
    const reqClone = req.clone();
    try {
        const isVerified = await verifyWebhookSignature(req);

        if (!isVerified) {
            console.warn('Webhook signature verification failed.');
            return NextResponse.json({ message: 'Signature verification failed.' }, { status: 403 });
        }
        
    } catch(err: any) {
        console.error('Error in webhook signature verification:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed.', details: err.message }, { status: 400 });
    }

    // --- If verified, process the event ---
    try {
        const event = await reqClone.json();
        const eventType = event.event_type;
        
        console.log(`Received PayPal webhook event: ${eventType}`);

        if (eventType === 'CHECKOUT.ORDER.APPROVED') {
            const orderID = event.resource.id;
            console.log(`Processing CHECKOUT.ORDER.APPROVED for Order ID: ${orderID}`);

            // Capture the order to finalize payment
            // The captureOrder function is idempotent, so it's safe to call it here
            // even if the client-side call also triggers it.
            const capturedData = await captureOrder(orderID);

            if (capturedData.status !== 'COMPLETED') {
                console.warn(`Order ${orderID} capture status is not COMPLETED. It is ${capturedData.status}. Not sending email.`);
                // We can't proceed if it's not completed.
                return NextResponse.json({ message: 'Order not completed.' });
            }

            // --- Handle Successful Payment ---
            const purchaseUnit = capturedData.purchase_units[0];
            const customerName = capturedData.payer.name.given_name || 'Valued Customer';
            const customerEmail = capturedData.payer.email_address;
            const orderTotal = parseFloat(purchaseUnit.amount.value);
            
            // Match items from PayPal back to our products to get download URLs
            const purchasedItems: ProductInfo[] = purchaseUnit.items.map((item: any) => {
                const product = allProducts.find(p => p.id === item.sku);
                if (!product) {
                    // This should ideally not happen if SKUs are managed well
                    console.warn(`Product with SKU ${item.sku} not found!`);
                    return null;
                }
                return {
                    name: product.name,
                    quantity: parseInt(item.quantity, 10),
                    price: parseFloat(item.unit_amount.value),
                    downloadUrl: product.downloadUrl,
                };
            }).filter((item: ProductInfo | null): item is ProductInfo => item !== null);

            // Send confirmation email
            if (customerEmail) {
                await sendOrderConfirmationEmail({
                    customerName,
                    customerEmail,
                    total: orderTotal,
                    orderId: capturedData.id,
                    products: purchasedItems,
                });
            } else {
                console.error(`Could not send confirmation email for order ${capturedData.id}: No customer email found.`);
            }

            console.log(`Successfully processed webhook for Order ID: ${orderID}`);
        }

        return NextResponse.json({ status: 'received' });

    } catch (error: any) {
        console.error('Failed to process webhook event:', error);
        return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
    }
}

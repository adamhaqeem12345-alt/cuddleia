
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';
import { products as allProducts } from '@/lib/products';
import { sendOrderConfirmationEmail } from '@/lib/email';
import type { CartItem } from '@/lib/types';
import type { ProductInfo } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { orderID } = await req.json();

        if (!orderID) {
            return NextResponse.json({ error: 'Missing order ID.' }, { status: 400 });
        }

        const capturedData = await captureOrder(orderID);

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
            console.error('Could not send confirmation email: No customer email found in PayPal data.');
        }

        return NextResponse.json(capturedData);

    } catch (error: any) {
        console.error('Failed to capture order:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}

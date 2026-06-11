
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';
import { getProductById } from '@/lib/product-service'; // Use the new internal service
import { Product } from '@/interfaces/product'; // Use the central product interface

// We no longer need the getProductById fetch function here, as it's been replaced by the internal service.

export async function POST(req: NextRequest) {
    try {
        const { orderDetails } = await req.json();

        if (!orderDetails || orderDetails.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Invalid or incomplete order details provided.' }, { status: 400 });
        }

        const purchaseUnit = orderDetails.purchase_units[0];
        let customIdPayload;
        try {
            customIdPayload = JSON.parse(purchaseUnit.custom_id);
        } catch (e) {
            console.error(`CRITICAL: Failed to parse custom_id from PayPal confirmation for order ${orderDetails.id}. Payload: ${purchaseUnit.custom_id}`);
            return NextResponse.json({ success: true, message: 'Payment captured, but failed to process custom data.' });
        }
        
        const { name, email, phone, cart, totalAmountUSD } = customIdPayload;

        // Directly retrieve all product details from the local product service.
        const items = cart.map((item: any) => {
            const product = getProductById(item.id);
            if (product) {
                return { product, quantity: item.quantity };
            }
            console.warn(`Product with ID ${item.id} not found. Skipping from order.`);
            return null;
        }).filter((item): item is { product: Product; quantity: number } => item !== null);

        if (items.length !== cart.length) {
          console.error(`CRITICAL: Mismatch in cart items for order ${orderDetails.id}. Some products could not be found locally.`);
        }

        const order = {
            id: orderDetails.id,
            customerName: name,
            customerEmail: email,
            items: items,
            total: `${purchaseUnit.amount.value} ${purchaseUnit.amount.currency_code}`,
        };
        
        await sendOrderConfirmationEmail(order);
        
        try {
            const itemsList = order.items.map((i) => `- ${i.product.name} (x${i.quantity})`).join('\n');
            const telegramMessage = `
🛍️ *New PayPal Order!* 🛍️

Alhamdulillah, a new order has come in!

*Order ID:* ${order.id}
*Name:* ${order.customerName}
*Email:* ${order.customerEmail}
*Total:* ${order.total}

*Items:*
${itemsList}
            `;
            await sendTelegramNotification(telegramMessage);

            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
                const timestamp = new Date().toISOString();
                const productNames = order.items.map((i) => i.product.name).join(', ');
                const values = [[timestamp, order.customerName, order.customerEmail, phone || '', productNames, totalAmountUSD.toString()]];
                await appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values);
            }
        } catch (secondaryError: any) {
            console.error("Secondary action (Telegram/Sheets) for PayPal order failed:", secondaryError.message);
        }

        return NextResponse.json({ success: true, message: 'Order confirmed and processed.' });

    } catch (error: any) {
        console.error('Error in /api/paypal/confirm-order:', error);
        return NextResponse.json({ error: error.message || 'Failed to confirm order.' }, { status: 500 });
    }
}

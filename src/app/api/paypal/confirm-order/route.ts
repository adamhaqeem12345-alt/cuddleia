
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';
import { getProductById } from '@/lib/product-service';
import { Product } from '@/interfaces/product';

export async function POST(req: NextRequest) {
    try {
        const { orderDetails } = await req.json();

        if (!orderDetails || orderDetails.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Invalid order details.' }, { status: 400 });
        }

        const purchaseUnit = orderDetails.purchase_units[0];
        const { name, email, phone, cart, totalAmountUSD } = JSON.parse(purchaseUnit.custom_id);

        const items = cart.map((item: any) => {
            const product = getProductById(item.id);
            return product ? { product, quantity: item.quantity } : null;
        }).filter((i: any): i is { product: Product; quantity: number } => i !== null);

        const order = {
            id: orderDetails.id,
            customerName: name,
            customerEmail: email,
            items: items,
            total: `${purchaseUnit.amount.value} ${purchaseUnit.amount.currency_code}`,
        };
        
        /**
         * Sequential fulfillment to prevent function termination before email completes.
         */
        try {
            await sendOrderConfirmationEmail(order);

            const itemsList = order.items.map((i) => `- ${i.product.name}`).join('\n');
            const telegramMessage = `🛍️ *New Order!* 🛍️\n*Order ID:* ${order.id}\n*Name:* ${order.customerName}\n*Email:* ${order.customerEmail}\n\n*Items:*\n${itemsList}`;
            sendTelegramNotification(telegramMessage).catch(console.error);

            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
                const productNames = order.items.map((i) => i.product.name).join(', ');
                const values = [[new Date().toISOString(), order.customerName, order.customerEmail, phone || '', productNames, totalAmountUSD.toString()]];
                appendToSheet(spreadsheetId, 'Cuddleia Sales Log', values).catch(console.error);
            }
        } catch (fulfillmentError: any) {
            console.error("[PayPal API] Fulfillment Error:", fulfillmentError.message);
        }

        return NextResponse.json({ success: true, message: 'Order confirmed.' });

    } catch (error: any) {
        console.error('Error in /api/paypal/confirm-order:', error);
        return NextResponse.json({ error: error.message || 'Failed to confirm order.' }, { status: 500 });
    }
}

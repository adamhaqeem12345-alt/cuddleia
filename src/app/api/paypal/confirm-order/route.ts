
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
            return NextResponse.json({ error: 'Invalid or incomplete order details provided.' }, { status: 400 });
        }

        const purchaseUnit = orderDetails.purchase_units[0];
        let customIdPayload;
        try {
            customIdPayload = JSON.parse(purchaseUnit.custom_id);
        } catch (e) {
            console.error(`CRITICAL: Failed to parse custom_id from PayPal confirmation for order ${orderDetails.id}.`);
            return NextResponse.json({ success: true, message: 'Payment captured, but failed to process order context.' });
        }
        
        const { name, email, phone, cart, totalAmountUSD } = customIdPayload;

        const items = cart.map((item: any) => {
            const product = getProductById(item.id);
            if (product) {
                return { product, quantity: item.quantity };
            }
            return null;
        }).filter((item: any): item is { product: Product; quantity: number } => item !== null);

        const order = {
            id: orderDetails.id,
            customerName: name,
            customerEmail: email,
            items: items,
            total: `${purchaseUnit.amount.value} ${purchaseUnit.amount.currency_code}`,
        };
        
        // Primary Action: Fulfillment Email
        const emailSuccess = await sendOrderConfirmationEmail(order);
        
        // Secondary Actions (Parallelized)
        (async () => {
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
        })();

        if (!emailSuccess) {
            return NextResponse.json({ 
                success: true, 
                message: 'Payment received, but we encountered an issue delivering your download links via email. Please check your spam folder or contact hello@cuddleia.com' 
            });
        }

        return NextResponse.json({ success: true, message: 'Order confirmed and processed.' });

    } catch (error: any) {
        console.error('Error in /api/paypal/confirm-order:', error);
        return NextResponse.json({ error: error.message || 'Failed to confirm order.' }, { status: 500 });
    }
}

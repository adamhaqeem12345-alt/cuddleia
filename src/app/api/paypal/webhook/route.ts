
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { getProductById, Product } from '@/lib/products';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

const getPayPalAccessToken = async (): Promise<string> => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error('PayPal client ID or secret is not configured.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate with PayPal.');
    }

    const data = await response.json();
    return data.access_token;
};

// Function to verify the webhook signature
const verifyWebhook = async (req: NextRequest, rawBody: string) => {
    const accessToken = await getPayPalAccessToken();
    const url = 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature';

    const verificationData = {
        auth_algo: req.headers.get('paypal-auth-algo'),
        cert_url: req.headers.get('paypal-cert-url'),
        transmission_id: req.headers.get('paypal-transmission-id'),
        transmission_sig: req.headers.get('paypal-transmission-sig'),
        transmission_time: req.headers.get('paypal-transmission-time'),
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
    };

    const verifyResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
    });

    const verifyResult = await verifyResponse.json();

    return verifyResult.verification_status === 'SUCCESS';
};


export async function POST(req: NextRequest) {
    const rawBody = await req.text();

    try {
        const isVerified = await verifyWebhook(req, rawBody);
        
        if (!isVerified) {
            console.error('Webhook signature verification failed.');
            return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
        }

        const event = JSON.parse(rawBody);
        const eventType = event.event_type;

        console.log(`Received PayPal Webhook: ${eventType}`);

        switch (eventType) {
            case 'CHECKOUT.ORDER.COMPLETED':
                const orderData = event.resource;
                const purchaseUnit = orderData.purchase_units[0];
                const customId = purchaseUnit.custom_id; // Expecting cart items as JSON string

                try {
                    const cartItems = JSON.parse(customId);
                     const orderTotal = `${purchaseUnit.amount.value} ${purchaseUnit.amount.currency_code}`;
                     const order = {
                        id: orderData.id,
                        customerName: `${orderData.payer.name.given_name} ${orderData.payer.name.surname}`,
                        customerEmail: orderData.payer.email_address,
                        items: cartItems.map((item: any) => ({
                            product: getProductById(item.id)!,
                            quantity: item.quantity,
                        })).filter((item: any) => item.product),
                        total: orderTotal,
                    };

                    await sendOrderConfirmationEmail(order);
                    console.log(`Order confirmation email sent for order ${orderData.id}`);

                    // Send Telegram notification
                    const itemsList = order.items.map(i => `- ${i.product.name} (x${i.quantity})`).join('\n');
                    const telegramMessage = `
🛍️ *New PayPal Order!* 🛍️

Alhamdulillah, a new order has come in! So much barakah! ✨ Let's celebrate! 🥳

*Order ID:* ${order.id}
*Name:* ${order.customerName}
*Email:* ${order.customerEmail}
*Total:* ${order.total}

*Items:*
${itemsList}

Let's get this packed with love and duas! 💖
                    `;
                    await sendTelegramNotification(telegramMessage);

                    // Append to Google Sheet
                    try {
                        const timestamp = new Date(orderData.create_time).toISOString();
                        const itemsString = order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ');
                        const amount = parseFloat(purchaseUnit.amount.value);
                        // Columns: Date, Customer Name, Customer Email, Phone Number, Products Purchased, Amounts (USD)
                        await appendToSheet('Cuddleia Sales Log', [timestamp, order.customerName, order.customerEmail, '', itemsString, amount]);
                    } catch (sheetError) {
                        console.error("Failed to append PayPal order to Google Sheet:", sheetError);
                    }


                } catch (e) {
                     console.error('Error parsing custom_id or sending confirmations for PayPal webhook:', e);
                }
                
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing PayPal webhook:', error);
        return NextResponse.json({ error: error.message || 'An error occurred.' }, { status: 500 });
    }
}

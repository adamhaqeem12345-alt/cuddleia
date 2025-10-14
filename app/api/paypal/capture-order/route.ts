
import { NextRequest, NextResponse } from 'next/server';
import { addOrderToSheet, sendProductEmail, sendTelegramNotification } from '@/lib/server-actions';
import { Product } from '@/lib/products';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for production

async function getAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    return data.access_token;
}

interface CaptureRequestBody {
    orderID: string;
    customerName: string;
    customerEmail: string;
    items: Product[];
}

export async function POST(req: NextRequest) {
    try {
        const { orderID, customerName, customerEmail, items }: CaptureRequestBody = await req.json();

        const accessToken = await getAccessToken();

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (data.status === 'COMPLETED') {
            const totalAmount = parseFloat(data.purchase_units[0].payments.captures[0].amount.value);
            const productNames = items.map(item => item.name).join(', ');
            
            // --- FULFILLMENT ---
            const [emailResult, sheetResult] = await Promise.all([
                sendProductEmail({
                    to: customerEmail,
                    subject: `Your Cuddleia Order is Confirmed!`,
                    name: customerName,
                    items: items,
                }),
                addOrderToSheet({
                    customerName: customerName,
                    customerEmail: customerEmail,
                    products: productNames,
                    amount: totalAmount,
                }),
            ]);
            
            // --- NOTIFICATIONS ---
            let notificationMessage = `
✅ *New PayPal Order!* ✅

*Name:* ${customerName}
*Email:* ${customerEmail}
*Amount:* $${totalAmount.toFixed(2)} USD

*Items:*
${items.map(p => `  - ${p.name}`).join('\n')}

*Order ID:* ${orderID}
            `;

            if (!emailResult.success) {
                notificationMessage += `\n\n*⚠️ CRITICAL: FAILED TO SEND EMAIL*`;
                console.error(`[PayPal Capture] CRITICAL: FAILED TO SEND EMAIL to ${customerEmail}.`);
            }
             if (!sheetResult.success) {
                notificationMessage += `\n\n*⚠️ CRITICAL: FAILED TO ADD TO GOOGLE SHEET*`;
                console.error(`[PayPal Capture] CRITICAL: FAILED TO ADD TO GOOGLE SHEET for order ${orderID}.`);
            }

            await sendTelegramNotification({ message: notificationMessage });
            
            // --- RESPONSE ---
            return NextResponse.json(data);
        } else {
            console.error("PayPal Capture Failed:", data);
            const errorMessage = data.details?.[0]?.description || 'Payment not completed.';
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }
    } catch (error) {
        console.error("Internal Server Error on Capture:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Could not capture order: ${errorMessage}` }, { status: 500 });
    }
}


import { NextRequest, NextResponse } from 'next/server';

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

    const verifyResult = await response.json();

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
                const order = event.resource;
                console.log('Order completed:', order.id);
                // This is where you would fulfill the order:
                // 1. Check if you've already processed this order ID to prevent duplication.
                // 2. Look up the order in your database using order.purchase_units[0].custom_id (if you set one).
                // 3. Grant access to the digital product(s).
                // 4. Send a confirmation email to the customer.
                break;
            // You can add more cases for other events like:
            // case 'PAYMENT.SALE.REFUNDED':
            //     // Handle refunds
            //     break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        // Return a 200 OK response to acknowledge receipt of the webhook
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing PayPal webhook:', error);
        return NextResponse.json({ error: error.message || 'An error occurred.' }, { status: 500 });
    }
}

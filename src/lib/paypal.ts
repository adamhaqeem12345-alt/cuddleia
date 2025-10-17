import { CartItem } from "@/context/cart-context";

const getPayPalAccessToken = async () => {
    const apiEnv = process.env.PAYPAL_API_ENV || 'sandbox';

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal API credentials. Ensure NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set.");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = apiEnv === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token' 
        : 'https://api-m.paypal.com/v1/oauth2/token';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get PayPal access token: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.access_token;
};


export const createOrder = async (cart: CartItem[]) => {
    const accessToken = await getPayPalAccessToken();
    const apiEnv = process.env.PAYPAL_API_ENV || 'sandbox';
    const url = apiEnv === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com/v2/checkout/orders' 
        : 'https://api-m.paypal.com/v2/checkout/orders';

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: totalAmount,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: totalAmount
                        }
                    }
                },
                 items: cart.map((item) => ({
                    name: item.name,
                    unit_amount: {
                        currency_code: 'USD',
                        value: item.price.toFixed(2),
                    },
                    quantity: item.quantity.toString(),
                }))
            }]
        })
    });

    const json = await response.json();
    return { json, status: response.status };
};

export const captureOrder = async (orderID: string) => {
    const accessToken = await getPayPalAccessToken();
    const apiEnv = process.env.PAYPAL_API_ENV || 'sandbox';
    const url = apiEnv === 'sandbox' 
        ? `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`
        : `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    
    const json = await response.json();
    return { json, status: response.status };
};

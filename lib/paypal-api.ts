import type { CartItem } from '@/lib/types';
import { products } from './products';
import { sendOrderConfirmationEmail, type ProductInfo } from './email';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_API_URL) {
  throw new Error("Missing PayPal API credentials in .env file");
}

/**
 * Fetches an access token from the PayPal API.
 * The token is required for all subsequent API calls.
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to get access token: ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token;
}


/**
 * Creates a PayPal order.
 * @param cart - The user's shopping cart.
 */
export async function createOrder(cart: CartItem[]) {
  const accessToken = await getAccessToken();
  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/cart`;

  // --- Data Sanitization and Validation ---
  if (!cart || cart.length === 0) {
    throw new Error('Cart is empty.');
  }

  let itemTotalInCents = 0;
  const items = cart.map(cartItem => {
    const productDetails = products.find(p => p.id === cartItem.id);
    if (!productDetails) {
      throw new Error(`Product with ID ${cartItem.id} not found.`);
    }

    const priceInCents = Math.round(productDetails.price * 100);
    itemTotalInCents += priceInCents * cartItem.quantity;

    // Sanitize fields and enforce length limits
    const cleanName = productDetails.name.substring(0, 127);
    const cleanSku = productDetails.id.substring(0, 127);

    return {
      name: cleanName,
      sku: cleanSku,
      unit_amount: {
        currency_code: 'USD',
        value: (priceInCents / 100).toFixed(2),
      },
      quantity: String(cartItem.quantity),
    };
  });
  
  if (itemTotalInCents <= 0) {
    throw new Error('Order total must be greater than zero.');
  }

  const totalValue = (itemTotalInCents / 100).toFixed(2);
  
  const payload = {
    intent: 'CAPTURE',
    // Configuration to streamline guest checkout (pay with card)
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
      shipping_preference: 'NO_SHIPPING', // For digital goods
      user_action: 'PAY_NOW', // Presents a "Pay Now" button to the user
      payment_method: {
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED', // Informs PayPal the user should pay immediately
      },
      landing_page: 'GUEST_CHECKOUT', // Attempts to default the user to the card payment form
    },
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: totalValue,
        breakdown: {
          item_total: {
            currency_code: 'USD',
            value: totalValue,
          },
        },
      },
      items: items,
    }],
  };

  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `cuddleia-order-${Date.now()}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error("PayPal API Error:", JSON.stringify(errorBody, null, 2));
    const issue = errorBody.details?.[0]?.description || 'An unknown error occurred with PayPal.';
    throw new Error(`PayPal rejected the order. Details: ${issue}`);
  }

  const orderData = await response.json();
  const approveLink = orderData.links.find((link: any) => link.rel === 'approve');
  
  if (!approveLink) {
    throw new Error('Could not find PayPal approval link.');
  }

  return { id: orderData.id, approveUrl: approveLink.href };
}

/**
 * Captures a payment for a previously created PayPal order.
 * @param orderId - The ID of the PayPal order.
 */
export async function captureOrder(orderId: string) {
    const accessToken = await getAccessToken();

    // Check order status first to make it idempotent
    const orderDetailsResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    });
    if (!orderDetailsResponse.ok) {
        throw new Error('Failed to fetch order details.');
    }
    const orderDetails = await orderDetailsResponse.json();
    
    // If already captured, process and return success without re-capturing
    if (orderDetails.status === 'COMPLETED') {
        console.log(`Order ${orderId} was already completed. Processing as success.`);
        const email = orderDetails.payer.email_address;
        const name = `${orderDetails.payer.name.given_name} ${orderDetails.payer.name.surname}`;
        const total = parseFloat(orderDetails.purchase_units[0].amount.value);
        const productInfos = await getProductInfoFromOrder(orderDetails);
        
        // We do not resend the email to avoid duplicates.
        // await sendOrderConfirmationEmail({ customerEmail: email, customerName: name, total, orderId, products: productInfos });
        
        return { success: true, products: productInfos };
    }


    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'PayPal-Request-Id': `cuddleia-capture-${orderId}-${Date.now()}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("PayPal Capture Error:", JSON.stringify(errorBody, null, 2));
        throw new Error('PayPal failed to capture the payment.');
    }

    const capturedData = await response.json();
    
    // On successful capture, extract details and send email
    if (capturedData.status === 'COMPLETED') {
        const email = capturedData.payer.email_address;
        const name = `${capturedData.payer.name.given_name} ${capturedData.payer.name.surname}`;
        const total = parseFloat(capturedData.purchase_units[0].amount.value);
        const productInfos = await getProductInfoFromOrder(capturedData);
        
        await sendOrderConfirmationEmail({ customerEmail: email, customerName: name, total, orderId, products: productInfos });
        
        return { success: true, products: productInfos };
    }
    
    return { success: false, products: [] };
}


/**
 * Helper to extract product info from a captured order for the confirmation email.
 */
async function getProductInfoFromOrder(orderData: any): Promise<ProductInfo[]> {
    const items = orderData.purchase_units[0].items;
    return items.map((item: any) => {
        const product = products.find(p => p.id === item.sku);
        if (!product) {
            // This should not happen if our data is consistent
            console.warn(`Product with SKU ${item.sku} not found in local products list.`);
            return {
                name: item.name,
                quantity: parseInt(item.quantity, 10),
                price: parseFloat(item.unit_amount.value),
                downloadUrl: '' // No download link if product not found
            };
        }
        return {
            name: product.name,
            quantity: parseInt(item.quantity, 10),
            price: product.price,
            downloadUrl: product.downloadUrl,
        };
    });
}

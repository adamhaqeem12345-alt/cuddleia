
import type { CartItem } from '@/lib/types';
import { products } from './products';
import { sendOrderConfirmationEmail, type ProductInfo } from './email';

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API, NEXT_PUBLIC_SITE_URL, EMAIL_USER, EMAIL_PASS, PAYPAL_WEBHOOK_ID } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_API || !NEXT_PUBLIC_SITE_URL || !EMAIL_USER || !EMAIL_PASS || !PAYPAL_WEBHOOK_ID) {
  throw new Error("Missing required PayPal, site URL, or email environment variables in .env file");
}

/**
 * Fetches an access token from the PayPal API.
 * The token is required for all subsequent API calls.
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
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
  const returnUrl = `${NEXT_PUBLIC_SITE_URL}/checkout/success`;
  const cancelUrl = `${NEXT_PUBLIC_SITE_URL}/cart`;

  if (!cart || cart.length === 0) {
    throw new Error('Cart is empty.');
  }

  let itemTotalInCents = 0;

  const items = cart.map((cartItem) => {
    const productDetails = products.find(p => p.id === cartItem.id);
    if (!productDetails) {
      throw new Error(`Product with ID ${cartItem.id} not found.`);
    }
    
    // Sanitize SKU: Replace invalid characters. PayPal allows alphanumeric, underscores, and spaces.
    const sanitizedSku = productDetails.id.replace(/[^a-zA-Z0-9_ -]/g, '_').substring(0, 127);
    
    // productDetails.price is now in cents, so it's an integer.
    const unitPriceInCents = productDetails.price;
    itemTotalInCents += unitPriceInCents * cartItem.quantity;

    return {
      name: "Cuddleia Digital Product",
      sku: sanitizedSku,
      unit_amount: {
        currency_code: 'USD',
        value: (unitPriceInCents / 100).toFixed(2), // Convert cents to dollars string for PayPal
      },
      quantity: String(cartItem.quantity),
      category: 'DIGITAL_GOODS' as const,
    };
  });
  
  if (itemTotalInCents <= 0) {
    throw new Error('Order total must be greater than zero.');
  }
  
  // Convert total cents to a string with 2 decimal places
  const totalValue = (itemTotalInCents / 100).toFixed(2);
  
  const payload = {
    intent: 'CAPTURE',
    application_context: {
      return_url: `${returnUrl}?orderId={CHECKOUT_ORDER_ID}`,
      cancel_url: cancelUrl,
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      brand_name: 'Cuddleia',
    },
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: totalValue,
        breakdown: {
            item_total: {
                currency_code: 'USD',
                value: totalValue,
            }
        }
      },
      items: items,
    }],
  };

  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
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
    const orderDetailsResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
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
        const productInfos = await getProductInfoFromOrder(orderDetails);
        // The email would have been sent on the initial capture. Do not resend.
        return { success: true, products: productInfos };
    }


    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
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
        const total = parseFloat(capturedData.purchase_units[0].payments.captures[0].amount.value);
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
        // Find product by comparing sanitized SKU
        const product = products.find(p => p.id.replace(/[^a-zA-Z0-9_ -]/g, '_').substring(0, 127) === item.sku);
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
            price: product.price / 100, // Convert cents back to dollars for email
            downloadUrl: product.downloadUrl,
        };
    });
}


import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendTelegramNotification } from '@/lib/telegram';
import { appendToSheet } from '@/lib/google-sheets';

// Re-define the Product interface, as it's no longer imported.
// In a mature microservices architecture, this might live in a shared types package.
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: 'Booklets' | 'Wallpapers';
    downloadUrl?: string;
    disclaimer: string;
    bundleIncludes?: string[];
    bundleProducts?: Product[];
}

// The URL for the new product service. In a Kubernetes environment, this would be a service name.
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

// Fetches a product from the new microservice.
const getProductById = async (id: string): Promise<Product | undefined> => {
    try {
        const response = await fetch(`${PRODUCT_SERVICE_URL}/products/${id}`);
        if (!response.ok) {
            console.error(`Failed to fetch product ${id} from product-service: ${response.statusText}`);
            return undefined;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error connecting to product-service to fetch ${id}:`, error);
        return undefined;
    }
};

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

        // Asynchronously fetch all product details from the product service.
        const items = (await Promise.all(cart.map(async (item: any) => {
            const product = await getProductById(item.id);
            if (product) {
                return { product, quantity: item.quantity };
            }
            console.warn(`Product with ID ${item.id} not found. Skipping from order.`);
            return null; // Return null for items where the product couldn't be fetched.
        }))).filter((item): item is { product: Product; quantity: number } => item !== null);

        if (items.length !== cart.length) {
          // If some products could not be fetched, this could be a critical issue.
          // For now, we will log a warning and proceed with the items that were found.
          console.error(`CRITICAL: Mismatch in cart items for order ${orderDetails.id}. Some products could not be fetched.`);
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

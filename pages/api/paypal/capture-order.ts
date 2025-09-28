import type { NextApiRequest, NextApiResponse } from 'next';
import { captureOrder } from '@/lib/paypal';
import { products } from '@/lib/products';
import { sendOrderConfirmationEmail, ProductInfo } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Capture the payment and get order details
        const captureData = await captureOrder(orderId);

        // This part is very important: Reconstruct the purchased items from your database
        // to ensure the download links and prices are correct and not manipulated on the client-side.
        // The `custom_id` or `sku` from the PayPal order can be used to look up products.
        // For this example, we assume we can get this info from the original order if needed,
        // but for now, we'll simulate it. This needs to be robust in a real app.
        // Let's assume the checkout session stored the product IDs.
        // In a real app, you'd fetch the order from PayPal again to get item SKUs.
        // For now, we don't have the cart, so we'll leave the products array empty.
        // A full implementation would pass the cart items to the capture function or store them in a session.
        
        const emailPayload = {
            customerName: captureData.customerName,
            customerEmail: captureData.customerEmail || 'customer-email-not-found@example.com', // Fallback
            orderId: captureData.orderId,
            total: captureData.total,
            // In a real application, you MUST fetch the products associated with this order from your DB
            // to prevent users from manipulating the cart to get different download links.
            // For now, we cannot access the cart here. A more advanced setup is needed for that.
            // A simple solution is to send a generic email and have them log in to a customer portal.
            // For now, we will send an email without download links.
            products: [] as ProductInfo[] 
        };

        if (emailPayload.customerEmail) {
            await sendOrderConfirmationEmail(emailPayload);
        }

        res.status(200).json({ success: true, orderId: captureData.orderId });

    } catch (error: any) {
        console.error('API Error - capture-order:', error);
        res.status(500).json({ error: error.message || 'Failed to capture payment' });
    }
}

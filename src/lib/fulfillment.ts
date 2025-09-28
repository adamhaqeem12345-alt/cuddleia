'use server';

import { products } from '@/lib/products';
import { sendEmail } from '@/lib/mail';
import { hasOrderBeenProcessed, markOrderAsProcessed } from '@/lib/order-log';

// This function constructs a basic HTML email body.
const createEmailHtml = (orderData: any): string => {
    const purchaseItems: { name: string, downloadUrl: string }[] = orderData.purchase_units?.[0]?.items?.map((item: { sku: string; }) => {
        const product = products.find(p => p.id === item.sku);
        return product ? { name: product.name, downloadUrl: product.downloadUrl } : null;
    }).filter(Boolean) || [];

    if (purchaseItems.length === 0) {
        console.warn(`Could not determine specific items for order ${orderData.id}. Sending a generic confirmation.`);
        return `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Thank You for Your Cuddleia Purchase!</h2>
                <p>Hello ${orderData.payer.name.given_name},</p>
                <p>We've confirmed your payment for order <strong>${orderData.id}</strong>. Your items are being processed.</p>
                <p>If you don't receive a separate email with download links shortly, please contact us at hello@cuddleia.com.</p>
                <p>Warmly,<br>The Cuddleia Team</p>
            </div>
        `;
    }

    const itemsHtml = purchaseItems.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>Download Link: <a href="${item.downloadUrl}">Click here to download</a></p>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank You for Your Cuddleia Purchase!</h2>
            <p>Hello ${orderData.payer.name.given_name},</p>
            <p>We've confirmed your payment and your digital goods are ready for download. Your order ID is <strong>${orderData.id}</strong>.</p>
            <hr>
            <h3>Your Items:</h3>
            ${itemsHtml}
            <hr>
            <p>If you have any questions or need assistance, please don't hesitate to contact us by replying to this email.</p>
            <p>Warmly,<br>The Cuddleia Team</p>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                <p><strong>Terms of Use:</strong> All digital products are for personal use only. They are not to be sold, redistributed, or used for commercial purposes. Thank you for respecting the heart and effort put into these creations.</p>
            </div>
        </div>
    `;
};

/**
 * Fulfills an order by sending a confirmation and download email,
 * ensuring the order is only processed once.
 * @param orderData The PayPal order data object.
 */
export async function fulfillOrder(orderData: any): Promise<void> {
    const orderId = orderData.id;
    
    if (await hasOrderBeenProcessed(orderId)) {
        console.log(`FULFILLMENT: Order ${orderId} has already been processed. Skipping.`);
        return;
    }

    const recipientEmail = orderData.payer?.email_address;
    if (!recipientEmail) {
        console.error(`FULFILLMENT ERROR: Cannot send email. Payer email is missing for order ${orderId}.`);
        return;
    }
    
    console.log(`FULFILLMENT: Processing order ${orderId} for ${recipientEmail}.`);
    
    try {
        const emailHtml = createEmailHtml(orderData);
        await sendEmail({
            to: recipientEmail,
            subject: `Your Cuddleia Order & Download Links (${orderId})`,
            html: emailHtml,
        });

        // Mark the order as processed ONLY after the email is successfully sent.
        await markOrderAsProcessed(orderId);
        
        console.log(`FULFILLMENT: Successfully sent download email and marked order ${orderId} as processed.`);
    } catch (emailError) {
        console.error(`FULFILLMENT ERROR: Failed to send email for order ${orderId}. The order will not be marked as processed and can be retried.`, emailError);
        throw new Error(`Failed to send fulfillment email for order ${orderId}`);
    }
}

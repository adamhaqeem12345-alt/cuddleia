// This is a server-side file.
import nodemailer from 'nodemailer';
import type { Product } from './products';

interface CustomerDetails {
    name: string;
    email: string;
}

interface OrderDetails {
    orderId: string;
    total: string;
    paymentMethod: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        downloadUrl?: string;
    }[];
}

const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_MAIL_HOST,
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.ZOHO_MAIL_USER,
        pass: process.env.ZOHO_MAIL_PASSWORD,
    },
});

function generateEmailBody(customer: CustomerDetails, order: OrderDetails): string {
    const itemsHtml = order.items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
            <div>
                <h3 style="margin: 0; font-size: 16px; color: #333;">${item.name} (x${item.quantity})</h3>
                ${item.downloadUrl ? `<a href="${item.downloadUrl}" style="background-color: #F4B4C9; color: #fff; padding: 8px 12px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Download Now</a>` : ''}
            </div>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #F9E6EB; padding: 20px; text-align: center;">
                <h1 style="color: #345; margin: 0;">Cuddleia</h1>
                <p style="color: #555; margin-top: 5px;">Your digital goods are here!</p>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #345;">Hi ${customer.name},</h2>
                <p>Thank you for your purchase! We're so excited to share our creations with you. You can access your digital products using the links below.</p>
                <div style="margin-top: 20px; margin-bottom: 20px;">
                    ${itemsHtml}
                </div>
                <h3 style="border-top: 1px solid #eee; padding-top: 15px; margin-top:20px; color: #555;">Order Summary:</h3>
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
                <p style="margin: 5px 0;"><strong>Total Paid:</strong> ${order.total}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p style="margin-top: 25px;">If you have any questions, please don't hesitate to reply to this email.</p>
                <p>With love,<br/>The Cuddleia Team</p>
            </div>
            <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                &copy; ${new Date().getFullYear()} Cuddleia. All rights reserved.
            </div>
        </div>
    `;
}

export async function sendPurchaseConfirmationEmail(customer: CustomerDetails, order: OrderDetails) {
    if (!process.env.ZOHO_MAIL_USER) {
        console.error("ZOHO_MAIL_USER is not set. Cannot send email.");
        // In a real app, you might want to have a fallback or a more robust error handling system.
        return;
    }

    const mailOptions = {
        from: `"Cuddleia" <${process.env.ZOHO_MAIL_USER}>`,
        to: customer.email,
        subject: `Your Cuddleia Order is Confirmed! (Order #${order.orderId})`,
        html: generateEmailBody(customer, order),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Purchase confirmation email sent to ${customer.email} for order ${order.orderId}`);
    } catch (error) {
        console.error(`Failed to send email for order ${order.orderId}:`, error);
        // This should be logged to a monitoring service.
        throw new Error('Failed to send purchase confirmation email.');
    }
}

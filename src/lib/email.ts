
import nodemailer from 'nodemailer';
import { Product } from '@/interfaces/product';
import { sendTelegramNotification } from './telegram';

/**
 * @fileOverview Hardened email fulfillment system for Cuddleia.
 * Line-by-line audit conducted to resolve Zoho SMTP delivery failures and UI hangs.
 */

const checkEnv = () => {
    const required = ['EMAIL_USER', 'EMAIL_PASS'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`[Email System] CRITICAL: Missing environment variables: ${missing.join(', ')}`);
        return false;
    }
    return true;
};

// Singleton transporter to prevent socket exhaustion and handshake instability
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 587,
            secure: false, // false for Port 587 (STARTTLS)
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER?.trim(),
                pass: process.env.EMAIL_PASS?.trim(),
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            // Enables detailed SMTP transcript in server logs for Adam to audit
            debug: true,
            logger: true,
        });
    }
    return transporter;
};

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    items: { product: Product; quantity: number }[];
    total: string;
}

const generateOrderEmailHtml = (order: Order) => {
    const styles = {
        container: "font-family: 'Alegreya', serif; color: #333; max-width: 600px; margin: 0 auto;",
        header: "background-color: #F9E6EB; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;",
        body: "padding: 30px; background-color: #ffffff; border: 1px solid #F6DEE4;",
        footer: "background-color: #F9E6EB; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 16px 16px; color: #777;",
        h1: "color: #EC5C8C; margin: 0; font-size: 28px;",
        table: "width: 100%; border-collapse: collapse; margin-top: 20px;",
        th: "border-bottom: 2px solid #F6DEE4; padding: 12px; text-align: left; font-weight: bold; color: #333;",
        td: "border-bottom: 1px solid #F6DEE4; padding: 12px; vertical-align: top;",
        downloadBtn: "display: inline-block; padding: 10px 20px; background-color: #EC5C8C; color: #ffffff !important; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px; margin-top: 10px; border: none;",
        total: "text-align: right; font-size: 20px; font-weight: bold; color: #EC5C8C; margin-top: 20px;"
    };

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${item.product.name}</div>
                ${item.product.downloadUrl ? `
                    <div style="margin-top: 8px;">
                        <a href="${item.product.downloadUrl}" target="_blank" style="${styles.downloadBtn}">
                            Download Now
                        </a>
                    </div>
                ` : '<span style="font-size: 12px; color: #999;">Download link will be sent separately.</span>'}
            </td>
            <td style="${styles.td}">${item.quantity}</td>
            <td style="${styles.td}">$${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.h1}">Cuddleia</h1>
                <p style="margin-top: 10px; color: #666; font-size: 18px;">Your Digital Assets are Ready!</p>
            </div>
            <div style="${styles.body}">
                <p style="font-size: 18px;">Assalamu'alaikum <strong>${order.customerName}</strong>,</p>
                <p>Alhamdulillah, your purchase is complete! Below you will find the download links for your cozy digital goods.</p>
                
                <p style="background: #FDF2F5; padding: 12px; border-radius: 8px; font-size: 14px; margin: 20px 0;">
                    <strong>Order Confirmation:</strong> #${order.id}
                </p>

                <table style="${styles.table}">
                    <thead>
                        <tr>
                            <th style="${styles.th}">Product</th>
                            <th style="${styles.th}">Qty</th>
                            <th style="${styles.th}">Price</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>

                <div style="${styles.total}">Total: ${order.total}</div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #F6DEE4; font-size: 14px; color: #666;">
                    <p><strong>Support:</strong> If you have any trouble downloading or using your files, simply reply to this email or reach us at <a href="mailto:hello@cuddleia.com" style="color: #EC5C8C; font-weight: bold;">hello@cuddleia.com</a>.</p>
                    <p>JazakumAllahu Khayran for supporting Cuddleia. We hope these products bring peace and barakah to your digital space.</p>
                </div>
            </div>
            <div style="${styles.footer}">
                <p>&copy; ${new Date().getFullYear()} Cuddleia. All rights reserved.</p>
                <p>Built with Heart and Barakah.</p>
            </div>
        </div>
    `;
};

export const sendOrderConfirmationEmail = async (order: Order) => {
    try {
        if (!checkEnv()) return false;

        const senderEmail = process.env.EMAIL_USER?.trim();
        const transporter = getTransporter();
        
        const emailHtml = generateOrderEmailHtml(order);
        const mailOptions = {
            from: senderEmail, // Strict raw email to satisfy Zoho security
            to: order.customerEmail,
            subject: `Your Digital Goods from Cuddleia (Order #${order.id})`,
            html: emailHtml,
        };

        console.log(`[Email System] Initiating delivery for #${order.id} to ${order.customerEmail}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email System] SUCCESS: Order #${order.id} delivered. MessageID: ${info.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`[Email System] DELIVERY FAILURE for #${order.id}:`, error.message);
        
        const alertMessage = `
🚨 *FULFILLMENT FAILURE* 🚨
Order ID: ${order.id}
Customer: ${order.customerName} (${order.customerEmail})
Error: ${error.message}
        `;
        await sendTelegramNotification(alertMessage);
        
        return false;
    }
};

const generateContactEmailHtml = (name: string, email: string, subject: string, message: string) => {
    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #EC5C8C;">New Inquiry</h1>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            </div>
        </div>
    `;
};

export const sendContactFormEmail = async (name: string, email: string, subject: string, message: string) => {
    try {
        if (!checkEnv()) throw new Error('Email credentials not configured');
        
        const senderEmail = process.env.EMAIL_USER?.trim();
        const transporter = getTransporter();
        const emailHtml = generateContactEmailHtml(name, email, subject, message);
        
        const mailOptions = {
            from: senderEmail, // Strict raw email
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            replyTo: email,
            subject: `[Contact Form] ${subject} from ${name}`,
            html: emailHtml,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('[Email System] Contact form inquiry delivered.');
        return true;
    } catch (error: any) {
        console.error('[Email System] Contact form failure:', error.message);
        throw error;
    }
};

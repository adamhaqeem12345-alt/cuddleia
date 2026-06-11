
import nodemailer from 'nodemailer';
import { Product } from '@/interfaces/product';
import { sendTelegramNotification } from './telegram';

/**
 * @fileOverview Hardened email fulfillment system for Cuddleia.
 * STRUCTURAL AUDIT: Fixed dynamic process.env access bug and mismatched key names.
 * DESIGN UPDATE: Aesthetic email template redesign.
 */

// Explicitly load .env for non-standard runtimes
if (typeof process !== 'undefined') {
    require('dotenv').config();
}

/**
 * Validates that the specific Zoho credentials exist in the environment.
 * STRUCTURAL FIX: Uses literal keys ZOHO_MAIL_USER and ZOHO_MAIL_APP_PASSWORD.
 */
const validateEnvironment = () => {
    const user = process.env.ZOHO_MAIL_USER;
    const pass = process.env.ZOHO_MAIL_APP_PASSWORD;
    
    if (!user || user.trim().length === 0) {
        throw new Error("Structural Bug: process.env.ZOHO_MAIL_USER is missing or empty in .env.");
    }
    if (!pass || pass.trim().length === 0) {
        throw new Error("Structural Bug: process.env.ZOHO_MAIL_APP_PASSWORD is missing or empty in .env.");
    }
    return { user: user.trim(), pass: pass.trim() };
};

/**
 * Creates a fresh transporter for every request using STARTTLS on Port 587.
 */
const createTransporter = () => {
    const { user, pass } = validateEnvironment();
    
    return nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: user,
            pass: pass,
        },
        requireTLS: true,
        debug: true,
        logger: true,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
};

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    items: { product: Product; quantity: number }[];
    total: string;
}

const generateOrderEmailHtml = (order: Order) => {
    // Brand Colors
    const primary = "#EC5C8C";
    const background = "#FED5E3";
    const surface = "#FFFFFF";
    const text = "#403438";
    const muted = "#8C7B81";

    const itemsHtml = order.items.map(item => `
        <div style="padding: 20px 0; border-bottom: 1px solid #F6DEE4;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="vertical-align: top;">
                        <div style="font-family: 'Georgia', serif; font-size: 18px; font-weight: bold; color: ${text}; margin-bottom: 4px;">${item.product.name}</div>
                        <div style="font-size: 14px; color: ${muted}; mb-4">Quantity: ${item.quantity}</div>
                        ${item.product.downloadUrl ? `
                            <div style="margin-top: 15px;">
                                <a href="${item.product.downloadUrl}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: ${primary}; color: #ffffff !important; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(236, 92, 140, 0.2);">
                                    Download Your Files
                                </a>
                            </div>
                        ` : '<div style="margin-top: 10px; font-size: 12px; color: #EC5C8C; font-style: italic;">Download link will be sent in a follow-up email.</div>'}
                    </td>
                    <td style="vertical-align: top; text-align: right; width: 80px;">
                        <div style="font-size: 18px; font-weight: bold; color: ${text};">$${(item.product.price * item.quantity).toFixed(2)}</div>
                    </td>
                </tr>
            </table>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Order from Cuddleia</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: ${background}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${background}; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: ${surface}; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                                    <div style="font-family: 'Georgia', serif; font-size: 32px; color: ${primary}; font-weight: bold; letter-spacing: -1px;">cuddleia</div>
                                    <div style="width: 40px; height: 2px; background-color: ${primary}; margin: 15px auto;"></div>
                                </td>
                            </tr>
                            
                            <!-- Hero Section -->
                            <tr>
                                <td style="padding: 0 40px 30px 40px; text-align: center;">
                                    <h1 style="font-family: 'Georgia', serif; font-size: 24px; color: ${text}; margin: 0;">Your digital goods are ready!</h1>
                                    <p style="font-size: 16px; color: ${muted}; line-height: 1.6; margin-top: 10px;">
                                        Assalamu'alaikum <strong>${order.customerName}</strong>,<br>
                                        Alhamdulillah, your purchase is complete. We hope these cozy goods bring peace and barakah to your digital space.
                                    </p>
                                </td>
                            </tr>

                            <!-- Order Details Box -->
                            <tr>
                                <td style="padding: 0 40px;">
                                    <div style="background-color: #FDF2F5; border-radius: 16px; padding: 25px;">
                                        <div style="font-size: 12px; color: ${primary}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Order Confirmation</div>
                                        <div style="font-size: 20px; font-weight: bold; color: ${text}; mb-2">#${order.id}</div>
                                        
                                        <div style="margin-top: 20px;">
                                            ${itemsHtml}
                                        </div>

                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                                            <tr>
                                                <td style="font-size: 18px; color: ${text};">Total Paid</td>
                                                <td style="text-align: right; font-size: 24px; font-weight: bold; color: ${primary};">${order.total}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>

                            <!-- Support Section -->
                            <tr>
                                <td style="padding: 40px; text-align: center;">
                                    <div style="font-size: 14px; color: ${muted}; line-height: 1.6;">
                                        <strong>Need help?</strong> If you have any trouble downloading your files, simply reply to this email or reach us at 
                                        <a href="mailto:hello@cuddleia.com" style="color: ${primary}; text-decoration: none; font-weight: bold;">hello@cuddleia.com</a>.
                                    </div>
                                    <div style="margin-top: 30px;">
                                        <p style="font-family: 'Georgia', serif; font-style: italic; color: ${text}; margin: 0;">With love and sincerity,</p>
                                        <p style="font-weight: bold; color: ${text}; margin: 5px 0 0 0;">The Cuddleia Team</p>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #F9E6EB; padding: 20px; text-align: center;">
                                    <div style="font-size: 12px; color: ${muted};">
                                        &copy; ${new Date().getFullYear()} Cuddleia. Built with Heart and Barakah.
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

export const sendOrderConfirmationEmail = async (order: Order) => {
    const { user } = validateEnvironment();
    const transporter = createTransporter();
    
    const emailHtml = generateOrderEmailHtml(order);
    const mailOptions = {
        from: `Cuddleia <${user}>`, 
        to: order.customerEmail,
        subject: `Your Digital Goods from Cuddleia (Order #${order.id})`,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email System] SUCCESS: Order #${order.id} delivered via ${user}`);
    } catch (error: any) {
        console.error(`[Email System] SMTP FAILURE:`, error.message);
        const alertMessage = `🚨 *FULFILLMENT FAILURE* 🚨\nOrder: ${order.id}\nError: ${error.message}`;
        sendTelegramNotification(alertMessage).catch(console.error);
        throw new Error(`SMTP Error [${error.code || 'CONNECTION_FAILED'}]: ${error.message}`);
    }
};

export const sendContactFormEmail = async (name: string, email: string, subject: string, message: string) => {
    const { user } = validateEnvironment();
    const transporter = createTransporter();
    
    const mailOptions = {
        from: `Cuddleia <${user}>`,
        to: user,
        replyTo: email,
        subject: `[Contact Form] ${subject} from ${name}`,
        html: `
            <div style="font-family: 'Georgia', serif; padding: 40px; background-color: #FDF2F5; color: #403438;">
                <h2 style="color: #EC5C8C;">New Inquiry Received</h2>
                <div style="background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #F6DEE4;">
                        <strong>Message:</strong><br>
                        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
                    </div>
                </div>
            </div>
        `,
    };
    
    try {
        await transporter.sendMail(mailOptions);
    } catch (error: any) {
        console.error('[Email System] Contact form failure:', error.message);
        throw new Error(`SMTP Error [${error.code || 'CONNECTION_FAILED'}]: ${error.message}`);
    }
};


import nodemailer from 'nodemailer';
import { Product } from '@/interfaces/product';

// --- Diagnostic Check ---
const requiredEnv = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error(`[Email System] CRITICAL: The following environment variables are missing: ${missingEnv.join(', ')}`);
    console.error(`[Email System] Please ensure these are defined in your .env file or deployment settings.`);
}

// --- Common Transporter ---
// Zoho Mail usually requires Port 465 with secure: true
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.zoho.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Tightened timeouts for Zoho performance
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 15000,   // 15 seconds
    socketTimeout: 30000,     // 30 seconds
    debug: false,             // Set to true only if actively debugging protocol
    logger: false,
});

// Verify connection configuration on startup
if (missingEnv.length === 0) {
    transporter.verify(function (error, success) {
      if (error) {
        console.error('[Email System] Connection Failed:', error.message);
        if (error.message.includes('EAUTH')) {
            console.error('[Email System] HINT: This is likely an authentication failure. If using Zoho with 2FA, you MUST use an "App Password" instead of your regular password.');
        }
      } else {
        console.log('[Email System] SUCCESS: Server is ready to deliver Barakah.');
      }
    });
}

// --- Order Confirmation Logic ---
export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    items: { product: Product; quantity: number }[];
    total: string;
}

const generateOrderEmailHtml = (order: Order) => {
    const styles = {
        container: `font-family: 'Alegreya', serif; color: #333; max-width: 600px; margin: 0 auto;`,
        header: `background-color: #F9E6EB; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;`,
        body: `padding: 30px; background-color: #ffffff; border: 1px solid #F6DEE4;`,
        footer: `background-color: #F9E6EB; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 16px 16px; color: #777;`,
        h1: `color: #EC5C8C; margin: 0; font-size: 28px;`,
        table: `width: 100%; border-collapse: collapse; margin-top: 20px;`,
        th: `border-bottom: 2px solid #F6DEE4; padding: 12px; text-align: left; font-weight: bold; color: #333;`,
        td: `border-bottom: 1px solid #F6DEE4; padding: 12px; vertical-align: top;`,
        downloadBtn: `display: inline-block; padding: 10px 20px; background-color: #EC5C8C; color: #ffffff !important; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px; margin-top: 10px; border: none;`,
        total: `text-align: right; font-size: 20px; font-weight: bold; color: #EC5C8C; margin-top: 20px;`
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
        if (missingEnv.length > 0) {
            console.error(`[Email System] Aborting delivery for #${order.id}: Missing credentials.`);
            return false;
        }

        console.log(`[Email System] Attempting delivery for #${order.id} to ${order.customerEmail}...`);
        
        const emailHtml = generateOrderEmailHtml(order);
        const mailOptions = {
            from: `"Cuddleia" <${process.env.EMAIL_FROM}>`,
            to: order.customerEmail,
            subject: `Your Digital Goods from Cuddleia (Order #${order.id})`,
            html: emailHtml,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email System] SUCCESS: Order #${order.id} delivered. ID: ${info.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`[Email System] ERROR for Order #${order.id}:`, error.message);
        return false;
    }
};

// --- Contact Form Logic ---
const generateContactEmailHtml = (name: string, email: string, subject: string, message: string) => {
    const styles = {
        container: `font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;`,
        header: `background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;`,
        body: `padding: 30px; border: 1px solid #ddd; border-top: none;`,
        footer: `background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;`,
        h1: `color: #EC5C8C; margin: 0;`,
        h2: `color: #333; border-bottom: 2px solid #F6DEE4; padding-bottom: 10px;`,
        field: `margin-bottom: 20px;`,
        label: `font-weight: bold; color: #555; display: block; margin-bottom: 4px;`,
        value: `color: #333;`,
        messageBox: `background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-top: 10px; font-style: italic;`
    };

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.h1}">New Inquiry</h1>
            </div>
            <div style="${styles.body}">
                <h2 style="${styles.h2}">Message Details</h2>
                <div style="${styles.field}">
                    <span style="${styles.label}">From:</span>
                    <span style="${styles.value}">${name}</span>
                </div>
                <div style="${styles.field}">
                    <span style="${styles.label}">Email:</span>
                    <a href="mailto:${email}" style="color: #EC5C8C;">${email}</a>
                </div>
                <div style="${styles.field}">
                    <span style="${styles.label}">Subject:</span>
                    <span style="${styles.value}">${subject}</span>
                </div>
                <div>
                    <span style="${styles.label}">Message:</span>
                    <div style="${styles.messageBox}">${message}</div>
                </div>
            </div>
            <div style="${styles.footer}">
                <p>Automated notification from Cuddleia Storefront.</p>
            </div>
        </div>
    `;
};

export const sendContactFormEmail = async (name: string, email: string, subject: string, message: string) => {
    try {
        if (missingEnv.length > 0) throw new Error('Missing email credentials');
        
        const emailHtml = generateContactEmailHtml(name, email, subject, message);
        const mailOptions = {
            from: `"Cuddleia Contact" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_TO,
            replyTo: email,
            subject: `[Contact Form] ${subject} from ${name}`,
            html: emailHtml,
        };
        await transporter.sendMail(mailOptions);
        console.log('[Email System] Contact form email sent successfully.');
        return true;
    } catch (error) {
        console.error('[Email System] Failed to send contact form email:', error);
        throw error;
    }
};

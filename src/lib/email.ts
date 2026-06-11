
import nodemailer from 'nodemailer';
import { Product } from '@/interfaces/product';

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
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('CRITICAL: SMTP Connection Error:', error);
  } else {
    console.log('Fulfillment Email Server is ready to deliver Barakah.');
  }
});

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
        downloadBtn: `display: inline-block; padding: 8px 16px; background-color: #EC5C8C; color: #ffffff; text-decoration: none; border-radius: 20px; font-weight: bold; font-size: 13px; margin-top: 8px;`,
        total: `text-align: right; font-size: 20px; font-weight: bold; color: #EC5C8C; margin-top: 20px;`
    };

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: bold; margin-bottom: 4px;">${item.product.name}</div>
                ${item.product.downloadUrl ? `
                    <a href="${item.product.downloadUrl}" style="${styles.downloadBtn}">
                        Download Your Product
                    </a>
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
                <p style="margin-top: 10px; color: #666;">Thank you for your purchase!</p>
            </div>
            <div style="${styles.body}">
                <p>Assalamu'alaikum <strong>${order.customerName}</strong>,</p>
                <p>Alhamdulillah, your order has been successfully processed. Below are your digital goods and order details.</p>
                
                <p style="background: #FDF2F5; padding: 10px; border-radius: 8px; font-size: 14px;">
                    <strong>Order ID:</strong> #${order.id}
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

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #F6DEE4; font-size: 14px; color: #666;">
                    <p><strong>Need help?</strong> If you have any trouble downloading your files, please simply reply to this email or contact us at <a href="mailto:hello@cuddleia.com" style="color: #EC5C8C;">hello@cuddleia.com</a>.</p>
                    <p>JazakumAllahu Khayran for supporting our small business and bringing a piece of Cuddleia into your digital home.</p>
                </div>
            </div>
            <div style="${styles.footer}">
                <p>&copy; ${new Date().getFullYear()} Cuddleia. Built with Heart and Barakah.</p>
                <p>Where Creativity Meets Sincerity.</p>
            </div>
        </div>
    `;
};

export const sendOrderConfirmationEmail = async (order: Order) => {
    try {
        console.log(`Attempting to send fulfillment email for order ${order.id} to ${order.customerEmail}...`);
        const emailHtml = generateOrderEmailHtml(order);
        const mailOptions = {
            from: `"Cuddleia" <${process.env.EMAIL_FROM}>`,
            to: order.customerEmail,
            subject: `Your Digital Goods from Cuddleia (Order #${order.id})`,
            html: emailHtml,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully. MessageId:', info.messageId);
        return true;
    } catch (error) {
        console.error('CRITICAL ERROR: Failed to send order confirmation email:', error);
        // We don't throw so the payment flow isn't interrupted, but the logs will show the failure.
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
        const emailHtml = generateContactEmailHtml(name, email, subject, message);
        const mailOptions = {
            from: `"Cuddleia Contact" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_TO,
            replyTo: email,
            subject: `[Contact Form] ${subject} from ${name}`,
            html: emailHtml,
        };
        await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully to business owner.');
        return true;
    } catch (error) {
        console.error('Failed to send contact form email:', error);
        throw error;
    }
};

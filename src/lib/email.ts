
import nodemailer from 'nodemailer';
import { Product } from '@/interfaces/product';

// --- Common Transporter ---
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
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
        container: `font-family: Arial, sans-serif; color: #333;`,
        header: `background-color: #f4f4f4; padding: 20px; text-align: center;`,
        body: `padding: 20px;`,
        footer: `background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px;`,
        h1: `color: #5a3a31;`,
        table: `width: 100%; border-collapse: collapse;`,
        th: `border-bottom: 1px solid #ddd; padding: 8px; text-align: left;`,
        td: `border-bottom: 1px solid #ddd; padding: 8px;`
    };
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="${styles.td}">${item.product.name}</td>
            <td style="${styles.td}">${item.quantity}</td>
            <td style="${styles.td}">$${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.h1}">Barakah's 'Ilm Matching</h1>
                <h2>Order Confirmation</h2>
            </div>
            <div style="${styles.body}">
                <p>Alhamdulillah, ${order.customerName}, your order is confirmed!</p>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <h3>Order Details:</h3>
                <table style="${styles.table}">
                    <thead>
                        <tr>
                            <th style="${styles.th}">Item</th>
                            <th style="${styles.th}">Quantity</th>
                            <th style="${styles.th}">Price</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <h3 style="text-align: right; margin-top: 20px;">Total: ${order.total}</h3>
                <p>We are preparing your order with love and care. You will receive a separate email once your order has shipped.</p>
                <p>If you have any questions, please reply to this email.</p>
                <p>JazakumAllahu Khayran for your support!</p>
            </div>
            <div style="${styles.footer}">
                <p>&copy; ${new Date().getFullYear()} Barakah's 'Ilm Matching. All rights reserved.</p>
            </div>
        </div>
    `;
};

export const sendOrderConfirmationEmail = async (order: Order) => {
    try {
        const emailHtml = generateOrderEmailHtml(order);
        const mailOptions = {
            from: `"Barakah's 'Ilm Matching" <${process.env.EMAIL_FROM}>`,
            to: order.customerEmail,
            subject: `Order Confirmed - Your Barakah's 'Ilm Matching Order #${order.id}`,
            html: emailHtml,
        };
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent to', order.customerEmail);
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
    }
};

// --- Contact Form Logic ---
const generateContactEmailHtml = (name: string, email: string, subject: string, message: string) => {
    const styles = {
        container: `font-family: Arial, sans-serif; color: #333; line-height: 1.6;`,
        header: `background-color: #f4f4f4; padding: 20px; text-align: center;`,
        body: `padding: 30px;`,
        footer: `background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px;`,
        h1: `color: #5a3a31;`,
        h2: `color: #5a3a31; border-bottom: 2px solid #ddd; padding-bottom: 10px;`,
        field: `margin-bottom: 20px;`,
        label: `font-weight: bold; color: #555;`,
        value: `margin-left: 10px;`,
        messageBox: `background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-top: 10px;`
    };

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.h1}">New Contact Form Submission</h1>
            </div>
            <div style="${styles.body}">
                <h2 style="${styles.h2}">Message Details</h2>
                <div style="${styles.field}">
                    <span style="${styles.label}">From:</span>
                    <span style="${styles.value}">${name}</span>
                </div>
                <div style="${styles.field}">
                    <span style="${styles.label}">Email:</span>
                    <a href="mailto:${email}">${email}</a>
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
                <p>This is an automated notification from your website's contact form.</p>
            </div>
        </div>
    `;
};

export const sendContactFormEmail = async (name: string, email: string, subject: string, message: string) => {
    try {
        const emailHtml = generateContactEmailHtml(name, email, subject, message);
        const mailOptions = {
            from: `"Barakah's 'Ilm Matching" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_TO, // The address that receives the contact form submissions
            replyTo: email,
            subject: `New Message from ${name}: ${subject}`,
            html: emailHtml,
        };
        await transporter.sendMail(mailOptions);
        console.log('Contact form email sent successfully.');
    } catch (error) {
        console.error('Failed to send contact form email:', error);
        // Re-throw the error to be caught by the API route
        throw error;
    }
};

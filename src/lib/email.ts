
import nodemailer from 'nodemailer';
import { Product } from './products';

// Define the shape of the order for the confirmation email
export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    items: {
        product: Product;
        quantity: number;
    }[];
    total: string; // e.g., "$70.00" or "Free"
}

// 1. Create a transporter
const zohoUser = process.env.ZOHO_MAIL_USER;
const zohoPass = process.env.ZOHO_MAIL_APP_PASSWORD;

if (!zohoUser || !zohoPass) {
    console.warn("Zoho Mail credentials are not set. Email functionality will be disabled.");
}

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // true for 465
    auth: {
        user: zohoUser,
        pass: zohoPass,
    },
});

// 2. Function to send the contact form submission
export async function sendContactFormEmail(name: string, email: string, subject: string, message: string) {
    if (!zohoUser) throw new Error("Email service is not configured.");

    const mailOptions = {
        from: `"Cuddleia Contact Form" <${zohoUser}>`,
        to: zohoUser,
        replyTo: email,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
            <h2>New message from your website's contact form</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

// 3. Function to send the order confirmation email
export async function sendOrderConfirmationEmail(order: Order) {
    if (!zohoUser) throw new Error("Email service is not configured.");
    
    // Generate the list of items for the email
    const itemsHtml = order.items.map(item => {
        // Handle bundles
        let downloadLinks = '';
        if (item.product.bundleIncludes && item.product.downloadUrl) {
             downloadLinks = `<li><a href="${item.product.downloadUrl}">Download Complete Collection</a></li>`;
        } else if (item.product.downloadUrl) {
             downloadLinks = `<li><a href="${item.product.downloadUrl}">Download Now</a></li>`;
        }

        return `
            <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <h3 style="margin-bottom: 5px;">${item.product.name} (x${item.quantity})</h3>
                ${downloadLinks ? `<p><strong>Your download links:</strong></p><ul>${downloadLinks}</ul>` : ''}
            </div>
        `;
    }).join('');

    const isFree = order.total.toLowerCase() === 'free';
    const subject = isFree ? `Your Free Cuddleia Guide Is Here!` : `Your Cuddleia Order Confirmation (#${order.id})`;
    const title = isFree ? `Here is your free guide, ${order.customerName}!` : `Thank you for your order, ${order.customerName}!`;
    const message = isFree ? `Thank you for your interest. Your digital product is ready for you to download. Here are the details:` : `We've received your order and your digital products are ready for you. Here are the details:`;

    const mailOptions = {
        from: `"Cuddleia" <${zohoUser}>`,
        to: order.customerEmail,
        subject: subject,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h1 style="color: #333;">${title}</h1>
                <p>${message}</p>
                <hr>
                ${itemsHtml}
                <hr>
                ${!isFree ? `<p style="font-size: 1.2em; font-weight: bold;">Total: ${order.total}</p>` : ''}
                <p>If you have any questions, please reply to this email.</p>
                <p>With warmth,<br>The Cuddleia Team</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}


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
    
    const itemsHtml = order.items.map(item => {
        const downloadUrl = item.product.bundleIncludes ? "https://drive.google.com/drive/folders/1ZSw8l2E9gFBD6sUyyok0S2VtKgMhoeNn" : item.product.downloadUrl;

        return `
            <div style="margin-bottom: 24px; padding: 16px; background-color: #2c2c2c; border-radius: 12px; display: flex; align-items: center; gap: 16px;">
                <img src="${item.product.imageUrl}" alt="${item.product.name}" style="width: 100px; height: 125px; object-fit: cover; border-radius: 8px;">
                <div style="color: #ffffff;">
                    <h3 style="margin: 0 0 8px; font-size: 18px; color: #ffffff;">${item.product.name}</h3>
                    <p style="margin: 0 0 16px; font-size: 14px; color: #bbbbbb; line-height: 1.5;">
                        ${item.product.description.split('\\n\\n')[0]}
                    </p>
                    <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #F4B4C9; color: #3A2B2D; text-decoration: none; border-radius: 9999px; font-weight: bold;">
                        Download Now
                    </a>
                </div>
            </div>
        `;
    }).join('');

    const isFree = order.total.toLowerCase() === 'free';
    const subject = isFree ? `Your Free Download from Cuddleia` : `Thank you for your order, ${order.customerName}!`;
    const title = isFree ? `Your free download is here, ${order.customerName}!` : `Thank you for your order, ${order.customerName}!`;
    const message = `We're so excited for you to enjoy your new digital goodies. Here are the download links for the items you purchased:`;

    const mailOptions = {
        from: `"Cuddleia" <${zohoUser}>`,
        to: order.customerEmail,
        subject: subject,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #1c1c1c; color: #ffffff; padding: 40px 20px; text-align: center;">
                <div style="max-width: 600px; margin: auto;">
                    <img src="https://i.postimg.cc/YS91wKqP/Pink-Blush-Circle-Creative-Logo-Design.png" alt="Cuddleia Logo" style="width: 80px; height: 80px; margin: 0 auto 16px;">
                    <h1 style="color: #F4B4C9; font-size: 24px; margin: 0;">Cuddleia</h1>
                    
                    <h2 style="font-size: 32px; margin: 40px 0 16px;">${title}</h2>
                    <p style="font-size: 16px; color: #bbbbbb; margin: 0 auto 40px; max-width: 480px; line-height: 1.5;">${message}</p>

                    <div style="text-align: left;">
                        ${itemsHtml}
                    </div>

                    <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #3c3c3c;">
                        <h2 style="font-size: 24px; margin: 0 0 16px;">Join Our Community!</h2>
                        <a href="https://t.me/+Tt1wP2OgPBE1NjU1" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #3c3c3c; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: bold;">
                            Join our Telegram Channel
                        </a>
                    </div>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

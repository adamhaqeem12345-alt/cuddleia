
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
        // Shorten description to the first sentence.
        const description = item.product.description.split('.')[0] + '.';

        return `
            <div style="margin-bottom: 24px; padding: 16px; background-color: #f9f9f9; border-radius: 12px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td width="120" valign="top">
                            <img src="${item.product.imageUrl}" alt="${item.product.name}" style="width: 100px; height: 125px; object-fit: cover; border-radius: 8px;">
                        </td>
                        <td valign="top" style="padding-left: 20px;">
                            <h3 style="margin: 0 0 8px; font-size: 18px; color: #000000; font-weight: bold;">${item.product.name}</h3>
                            <p style="margin: 0 0 16px; font-size: 14px; color: #555555; line-height: 1.5;">
                                ${description}
                            </p>
                            <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #F4B4C9; color: #2d2d2d; text-decoration: none; border-radius: 9999px; font-weight: bold; font-family: sans-serif;">
                                Download Now
                            </a>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }).join('');

    const isFree = order.total.toLowerCase() === 'free';
    const subject = isFree ? `Your Free Download from Cuddleia` : `Thank you for your order, ${order.customerName}!`;
    const title = isFree ? `Your free download is here, ${order.customerName}!` : `Thank you for your order, ${order.customerName}!`;
    const message = `We're so excited for you to enjoy your new digital goodies. Here are the download links for the items you purchased:`;
    const communityDescription = "Get exclusive updates, join discussions, and connect with fellow creatives in our cozy Telegram community.";

    const mailOptions = {
        from: `"Cuddleia" <${zohoUser}>`,
        to: order.customerEmail,
        subject: subject,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #ffffff; color: #000000; padding: 40px 20px; text-align: center;">
                <div style="max-width: 600px; margin: auto;">
                    <img src="https://i.postimg.cc/YS91wKqP/Pink-Blush-Circle-Creative-Logo-Design.png" alt="Cuddleia Logo" style="width: 80px; height: 80px; margin: 0 auto 16px; border-radius: 50%;">
                    <h1 style="color: #000000; font-size: 24px; margin: 0; font-weight: bold;">Cuddleia</h1>
                    
                    <h2 style="font-size: 32px; margin: 40px 0 16px; font-weight: bold;">${title}</h2>
                    <p style="font-size: 16px; color: #555555; margin: 0 auto 40px; max-width: 480px; line-height: 1.5;">${message}</p>

                    <div style="text-align: left;">
                        ${itemsHtml}
                    </div>

                    <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #eeeeee;">
                        <h2 style="font-size: 24px; margin: 0 0 16px; font-weight: bold;">Join Our Community!</h2>
                        <p style="font-size: 16px; color: #555555; margin: 0 auto 24px; max-width: 480px; line-height: 1.5;">${communityDescription}</p>
                        <a href="https://t.me/+Tt1wP2OgPBE1NjU1" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #F4B4C9; color: #2d2d2d; text-decoration: none; border-radius: 9999px; font-weight: bold; font-family: sans-serif;">
                            Join our Telegram Channel
                        </a>
                    </div>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

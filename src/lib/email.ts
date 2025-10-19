
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
            <div class="product-item">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td width="120" valign="top">
                            <img src="${item.product.imageUrl}" alt="${item.product.name}" style="width: 100px; height: 125px; object-fit: cover; border-radius: 8px;">
                        </td>
                        <td valign="top" style="padding-left: 20px;">
                            <h3 class="product-title">${item.product.name}</h3>
                            <p class="product-description">
                                ${description}
                            </p>
                            <a href="${downloadUrl}" target="_blank" class="button">
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
    const communityDescription = "Connect with fellow creators, share your journey, and get updates by joining our supportive corner on Telegram.";

    const mailOptions = {
        from: `"Cuddleia" <${zohoUser}>`,
        to: order.customerEmail,
        subject: subject,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background: linear-gradient(120deg, #F9E6EB 0%, #D0B4F4 100%);
                        color: #BF879B; /* Main Pink Text Color */
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        text-align: center;
                        padding: 40px 20px;
                    }
                    .content-wrapper {
                        max-width: 600px;
                        margin: auto;
                        background-color: rgba(255, 255, 255, 0.7);
                        border-radius: 24px;
                        padding: 40px;
                        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.18);
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 16px;
                        border-radius: 50%;
                    }
                    .main-title {
                        color: #BF879B;
                        font-size: 24px;
                        margin: 0;
                        font-weight: bold;
                    }
                    .sub-title {
                        font-size: 32px;
                        margin: 40px 0 16px;
                        font-weight: bold;
                        color: #BF879B;
                    }
                    .intro-text {
                        font-size: 16px;
                        color: #BF879B;
                        margin: 0 auto 40px;
                        max-width: 480px;
                        line-height: 1.5;
                    }
                    .product-list {
                        text-align: left;
                    }
                    .product-item {
                        margin-bottom: 24px;
                        padding: 16px;
                        background-color: rgba(255, 255, 255, 0.5);
                        border-radius: 12px;
                    }
                    .product-title {
                        margin: 0 0 8px;
                        font-size: 18px;
                        color: #BF879B;
                        font-weight: bold;
                    }
                    .product-description {
                        margin: 0 0 16px;
                        font-size: 14px;
                        color: #BF879B;
                        line-height: 1.5;
                    }
                    .community-section {
                        margin-top: 40px;
                        padding-top: 40px;
                        border-top: 1px solid rgba(191, 135, 155, 0.2);
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #F4B4C9;
                        color: #2d2d2d;
                        text-decoration: none;
                        border-radius: 9999px;
                        font-weight: bold;
                        font-family: sans-serif;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content-wrapper">
                        <img src="https://i.postimg.cc/YS91wKqP/Pink-Blush-Circle-Creative-Logo-Design.png" alt="Cuddleia Logo" class="logo">
                        <h1 class="main-title">Cuddleia</h1>
                        
                        <h2 class="sub-title">${title}</h2>
                        <p class="intro-text">${message}</p>

                        <div class="product-list">
                            ${itemsHtml}
                        </div>

                        <div class="community-section">
                            <h2 class="sub-title" style="margin-top: 0;">Join Our Community!</h2>
                            <p class="intro-text">${communityDescription}</p>
                            <a href="https://t.me/+Tt1wP2OgPBE1NjU1" target="_blank" class="button">
                                Join our Telegram Channel
                            </a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    await transporter.sendMail(mailOptions);
}

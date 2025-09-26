import nodemailer from 'nodemailer';

export interface ProductInfo {
    name: string;
    quantity: number;
    downloadUrl: string;
    price: number;
}

export interface EmailPayload {
    customerName: string;
    customerEmail: string;
    total: number;
    orderId: string;
    products: ProductInfo[];
}

export async function sendOrderConfirmationEmail(payload: EmailPayload) {
    const { customerName, customerEmail, total, orderId, products } = payload;
    
    // Basic validation
    if (!customerEmail || !customerName || !orderId || !products || products.length === 0) {
        console.error('sendOrderConfirmationEmail validation failed: Missing required fields.');
        // Silently fail to prevent crashes, but log the issue.
        return;
    }
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const productDetails = products.map(p => {
        return `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${p.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${p.price.toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(p.price * p.quantity).toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="4" style="padding: 5px 10px 10px; font-size: 14px; border-bottom: 1px solid #eee;">
                    <a href="${p.downloadUrl}" style="color: #3498db; text-decoration: none; font-weight: bold;">Download Now</a>
                </td>
            </tr>
        `;
    }).join('');

    const mailOptions = {
        from: `"Cuddleia" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Your Cuddleia Order Confirmation & Downloads (#${orderId})`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #fcefee; padding: 30px; text-align: center;">
                    <h1 style="color: #d95d78; margin: 0; font-size: 28px;">Thank You For Your Order!</h1>
                </div>
                <div style="padding: 30px 30px 40px;">
                    <h2 style="font-size: 22px; color: #333;">Hi ${customerName},</h2>
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        We've received your order and are so excited for you to enjoy your new digital goods. Your download links are ready for you below.
                    </p>
                    
                    <h3 style="font-size: 20px; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary (#${orderId})</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr>
                                <th style="padding: 10px; background-color: #f9f9f9; border-bottom: 1px solid #eee; text-align: left;">Product</th>
                                <th style="padding: 10px; background-color: #f9f9f9; border-bottom: 1px solid #eee; text-align: center;">Qty</th>
                                <th style="padding: 10px; background-color: #f9f9f9; border-bottom: 1px solid #eee; text-align: right;">Price</th>
                                <th style="padding: 10px; background-color: #f9f9f9; border-bottom: 1px solid #eee; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productDetails}
                        </tbody>
                    </table>

                    <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                        <p style="font-size: 22px; font-weight: bold; color: #333; margin: 0;">Total: $${total.toFixed(2)}</p>
                    </div>

                    <p style="font-size: 16px; color: #555; line-height: 1.6; margin-top: 30px;">
                        If you have any questions or need assistance, please don't hesitate to reply to this email. We're here to help!
                    </p>
                    <p style="font-size: 16px; color: #555; line-height: 1.6; margin-top: 10px;">
                        With love,<br/>The Cuddleia Team
                    </p>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    © ${new Date().getFullYear()} Cuddleia. All Rights Reserved.
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully to', customerEmail);
    } catch (error) {
        console.error('Error sending email:', error);
        // Do not re-throw here to prevent crashing the caller, especially a webhook.
    }
}

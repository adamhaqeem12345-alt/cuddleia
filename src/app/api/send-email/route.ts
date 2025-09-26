
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { products as allProducts } from '@/lib/products';

// Define the payload types directly in this file
interface ProductInfo {
    name: string;
    quantity: number;
}

interface EmailPayload {
    customerName: string;
    customerEmail: string;
    total: number;
    orderId: string;
    products: ProductInfo[];
}

// This is now a local helper function, NOT exported.
async function sendOrderConfirmationEmail(payload: EmailPayload) {
    const { customerName, customerEmail, total, orderId, products } = payload;
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const productDetails = products.map(p => {
        const productData = allProducts.find(prod => prod.name === p.name);
        return `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <h4 style="margin:0; font-size: 16px;">${p.name} (x${p.quantity})</h4>
                ${productData ? `<p style="margin: 5px 0 0; font-size: 14px;"><a href="${productData.downloadUrl}">Download Now</a></p>` : ''}
            </div>
        `;
    }).join('');

    const mailOptions = {
        from: `"Cuddleia" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: `Your Cuddleia Order Confirmation (#${orderId})`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Thank you for your order, ${customerName}!</h2>
                <p>We've received your order and are getting it ready. You can find your download links below.</p>
                
                <h3>Order Summary</h3>
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                    ${productDetails}
                    <p style="font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px;">Total: RM${total.toFixed(2)}</p>
                </div>

                <p>If you have any questions, feel free to reply to this email.</p>
                <p>With love,<br/>The Cuddleia Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully to', customerEmail);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}


// This is the valid Next.js API route export for the POST method.
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailPayload;
    await sendOrderConfirmationEmail(payload);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('API Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}

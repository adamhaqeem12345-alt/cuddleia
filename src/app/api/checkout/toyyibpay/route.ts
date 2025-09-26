
import { NextRequest, NextResponse } from 'next/server';
import type { CartItem } from '@/lib/types';
import { USD_TO_MYR_RATE } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

const TOYYIBPAY_API_URL = 'https://dev.toyyibpay.com/index.php/api/';
const USER_SECRET_KEY = process.env.TOYYIBPAY_USER_SECRET_KEY;
const CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE;

if (!USER_SECRET_KEY || !CATEGORY_CODE) {
    console.error("ToyyibPay environment variables are not set!");
}

async function sendOrderConfirmationEmail(customerEmail: string, customerName: string, cart: CartItem[], orderId: string, total: number) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const productLinks = cart.map(item => `
        <div>
            <strong>${item.name}</strong>: <a href="${item.downloadUrl}">Download Now</a>
        </div>
    `).join('');

    const emailBody = `
        <h1>Thank you for your order, ${customerName}!</h1>
        <p>We've received your payment and your order is complete. You can access your digital products using the links below:</p>
        ${productLinks}
        <p>Your Order ID: ${orderId}</p>
        <p>Total Paid: RM${total.toFixed(2)}</p>
        <p>If you have any questions, please reply to this email.</p>
        <p>Warmly,<br/>The Cuddleia Team</p>
    `;

    try {
        await transporter.sendMail({
            from: `"Cuddleia" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Your Cuddleia Order Confirmation (#${orderId})`,
            html: emailBody,
        });
        console.log(`Confirmation email sent to ${customerEmail}`);
    } catch (error) {
        console.error(`Failed to send email to ${customerEmail}:`, error);
    }
}


export async function POST(req: NextRequest) {
    if (!USER_SECRET_KEY || !CATEGORY_CODE) {
        return NextResponse.json({ error: 'Server payment configuration is incomplete.' }, { status: 500 });
    }

    try {
        const { cart, customerName, customerEmail } = await req.json();

        if (!cart || !customerName || !customerEmail) {
            return NextResponse.json({ error: 'Missing required checkout information.' }, { status: 400 });
        }

        const totalInUSD = cart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
        const totalInMYR = totalInUSD * USD_TO_MYR_RATE;
        const totalInCents = Math.round(totalInMYR * 100);

        const orderId = uuidv4();

        // Create bill on ToyyibPay
        const billParams = new URLSearchParams({
            userSecretKey: USER_SECRET_KEY,
            categoryCode: CATEGORY_CODE,
            billName: 'Cuddleia Digital Goods',
            billDescription: `Order #${orderId} - Cuddleia`,
            billPriceSetting: '1',
            billPayorInfo: '1',
            billAmount: totalInCents.toString(),
            billReturnUrl: `${process.env.NEXT_PUBLIC_URL}/thank-you?status=success`,
            billCallbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/toyyibpay`,
            billExternalReferenceNo: orderId,
            billTo: customerName,
            billEmail: customerEmail,
            billPhone: '0000000000', // Placeholder phone number
            billSplitPayment: '0',
            billSplitPaymentArgs: '',
            billPaymentChannel: '0', // 0 for all, 1 for FPX, 2 for credit card
            billContentEmail: `Thank you for your purchase of RM${(totalInCents / 100).toFixed(2)}!`,
            billChargeToCustomer: '1' // Pass charges to customer
        });

        const response = await fetch(`${TOYYIBPAY_API_URL}createBill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: billParams.toString(),
        });
        
        const data = await response.json();
        
        if (data.status === 'error' || !data[0]?.BillCode) {
            console.error('ToyyibPay Error:', data);
            return NextResponse.json({ error: 'Failed to create payment bill with ToyyibPay.' }, { status: 500 });
        }

        const billCode = data[0].BillCode;

        // Send confirmation email immediately - this is a temporary measure.
        // In a production system, you'd wait for the webhook to confirm payment.
        await sendOrderConfirmationEmail(customerEmail, customerName, cart, orderId, totalInMYR);


        const billUrl = `https://dev.toyyibpay.com/${billCode}`;
        
        return NextResponse.json({ billUrl });

    } catch (error) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred during checkout.' }, { status: 500 });
    }
}

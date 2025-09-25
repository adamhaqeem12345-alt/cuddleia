import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, name, cart, subtotal } = await request.json();

    // Create a transporter object using Zoho's SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.ZOHO_EMAIL, // Your Zoho email address from .env.local
        pass: process.env.ZOHO_PASSWORD, // Your Zoho App Password from .env.local
      },
    });

    const productList = cart.map((item: any) => `<li>${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}</li>`).join('');

    const mailOptions = {
      from: `"Cuddleia" <${process.env.ZOHO_EMAIL}>`,
      to: to,
      subject: 'Your Cuddleia Order Confirmation',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
          <h1 style="color: #333;">Thank you for your order, ${name}!</h1>
          <p>We've received your order and will process it shortly. Here are the details:</p>
          <h2>Order Summary</h2>
          <ul>
            ${productList}
          </ul>
          <h3>Total: $${subtotal}</h3>
          <p>You will receive another email with your download links shortly.</p>
          <p>With love,<br>The Cuddleia Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}

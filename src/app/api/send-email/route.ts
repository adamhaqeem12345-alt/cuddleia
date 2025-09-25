
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

    const productList = cart.map((item: any) => `
      <li style="margin-bottom: 20px;">
        <span style="font-weight: bold;">${item.name}</span> (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
        <br />
        <a href="${item.downloadUrl}" style="color: #3498db; text-decoration: none;">Download Here</a>
      </li>
    `).join('');

    const mailOptions = {
      from: `"Cuddleia" <${process.env.ZOHO_EMAIL}>`,
      to: to,
      subject: 'Your Cuddleia Order Confirmation & Downloads',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333; text-align: center;">Thank you for your order, ${name}!</h1>
          <p>We've received your order. You can access your digital downloads immediately using the links below.</p>
          <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Your Downloads</h2>
          <ul style="list-style: none; padding: 0;">
            ${productList}
          </ul>
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
            <h3 style="text-align: right;">Total: $${subtotal}</h3>
          </div>
          <p style="text-align: center; margin-top: 30px; color: #777;">With love,<br>The Cuddleia Team</p>
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

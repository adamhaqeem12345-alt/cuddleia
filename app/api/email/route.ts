
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Product } from '@/lib/products';

function createEmailBody(name: string, items: Product[]): string {
    const productsHtml = items.map(item => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <h3 style="margin-top: 0; font-size: 18px; color: #333;">${item.name}</h3>
            <p style="font-size: 14px; color: #555;">${item.description.substring(0,150)}...</p>
            <a href="${item.downloadUrl}" style="display: inline-block; padding: 10px 15px; background-color: #e83e8c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Now</a>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #e83e8c; font-size: 28px;">Cuddleia</h1>
            </div>
            <h2 style="font-size: 24px; color: #333;">Thank you for your order, ${name}!</h2>
            <p>We're so excited for you to enjoy your new digital goodies. Here are the download links for the items you purchased:</p>
            
            ${productsHtml}

            <p>If you have any questions or need assistance, please don't hesitate to reply to this email.</p>
            <p>With love,<br>The Cuddleia Team</p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #aaa;">
                <p style="font-weight: bold; color: #888;">Terms of Use:</p>
                <p>All digital products purchased from Cuddleia are for personal use only. You are not permitted to resell, redistribute, or share these files in any form. All rights are reserved by Cuddleia.</p>
                <p style="margin-top: 20px;">Cuddleia | Cozy Digital Goods with Heart</p>
            </div>
        </div>
    `;
}

export async function POST(req: NextRequest) {
  // Read environment variables inside the function to ensure they are available at runtime.
  const ZOHO_EMAIL = process.env.ZOHO_MAIL_USER;
  const ZOHO_PASSWORD = process.env.ZOHO_MAIL_PASS;

  if (!ZOHO_EMAIL || !ZOHO_PASSWORD) {
      console.error('CRITICAL: Missing Zoho Mail credentials in environment variables.');
      return NextResponse.json({ error: 'Email server is not configured. Please contact support.' }, { status: 500 });
  }
    
  try {
    const { to, subject, name, items } = await req.json();

    if (!to || !subject || !name || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: ZOHO_EMAIL,
            pass: ZOHO_PASSWORD,
        },
    });

    const mailOptions = {
      from: `"Cuddleia" <${ZOHO_EMAIL}>`,
      to: to,
      subject: subject,
      html: createEmailBody(name, items),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to send email', details: errorMessage }, { status: 500 });
  }
}

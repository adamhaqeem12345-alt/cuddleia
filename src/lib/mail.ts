'use server';

import nodemailer from 'nodemailer';

const { ZOHO_MAIL_USER, ZOHO_MAIL_PASS } = process.env;

if (!ZOHO_MAIL_USER || !ZOHO_MAIL_PASS) {
  console.warn("Zoho Mail environment variables are not fully set. Email sending will be disabled.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, 
  auth: {
    user: ZOHO_MAIL_USER,
    pass: ZOHO_MAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!ZOHO_MAIL_USER || !ZOHO_MAIL_PASS) {
     console.error("Cannot send email because Zoho credentials are not configured in environment variables.");
     throw new Error("Email service is not configured.");
  }
  
  const mailOptions = {
    from: `"Cuddleia" <${ZOHO_MAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email via Zoho:", error);
    throw new Error("Could not send email.");
  }
}

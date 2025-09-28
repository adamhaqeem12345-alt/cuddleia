'use server';

import nodemailer from 'nodemailer';

const { ZOHO_SMTP_USER, ZOHO_SMTP_PASS, EMAIL_FROM } = process.env;

if (!ZOHO_SMTP_USER || !ZOHO_SMTP_PASS || !EMAIL_FROM) {
  console.warn("Zoho Mail environment variables are not fully set. Email sending will be disabled.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: ZOHO_SMTP_USER,
    pass: ZOHO_SMTP_PASS, // Use App Password
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using Zoho Mail SMTP.
 * @param {EmailOptions} options - The email options.
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!ZOHO_SMTP_USER || !ZOHO_SMTP_PASS || !EMAIL_FROM) {
     console.error("Cannot send email because Zoho credentials are not configured in environment variables.");
     throw new Error("Email service is not configured.");
  }
  
  const mailOptions = {
    from: `"Cuddleia" <${EMAIL_FROM}>`,
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

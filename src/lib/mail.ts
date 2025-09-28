'use server';

import nodemailer from 'nodemailer';

const { ZOHO_MAIL_USER, ZOHO_MAIL_PASSWORD } = process.env;

if (!ZOHO_MAIL_USER || !ZOHO_MAIL_PASSWORD) {
  console.warn("Zoho Mail credentials are not set. Email sending will be disabled.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: ZOHO_MAIL_USER,
    pass: ZOHO_MAIL_PASSWORD,
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
  if (!ZOHO_MAIL_USER || !ZOHO_MAIL_PASSWORD) {
     console.error("Cannot send email because Zoho credentials are not configured.");
     throw new Error("Email service is not configured.");
  }
  
  const mailOptions = {
    from: `"Cuddleia" <${ZOHO_MAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
}

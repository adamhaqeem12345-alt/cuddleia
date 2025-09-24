
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

const TO_EMAIL = 'hello@cuddleia.com';
const SUBJECT_PREFIX = 'Cuddleia Contact Form';

export async function sendMessage(prevState: any, formData: FormData) {
  const validation = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validation.success) {
    return {
      message: '',
      error: validation.error.errors.map((e) => e.message).join(', '),
      isSuccess: false,
    };
  }

  const { name, email, message } = validation.data;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Cuddleia Contact Form <${process.env.ZOHO_EMAIL}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject: `${SUBJECT_PREFIX} - Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #d17b88;">New Message from your Contact Form</h2>
          <p>You have received a new message from the contact form on your website.</p>
          <div style="background-color: #fdf6f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    return {
      message: 'Your message has been sent successfully!',
      error: '',
      isSuccess: true,
    };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return {
      message: '',
      error: 'There was a problem sending your message. Please try again later.',
      isSuccess: false,
    };
  }
}

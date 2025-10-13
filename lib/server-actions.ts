
import { google } from 'googleapis';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { Product } from '@/lib/products';

// =================================================================================
// ADD TO GOOGLE SHEET LOGIC
// =================================================================================

const sheetRequestSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  products: z.string(),
  amount: z.number(),
});

type SheetData = z.infer<typeof sheetRequestSchema>;

export async function addOrderToSheet(data: SheetData): Promise<{ success: boolean; error?: string }> {
  const validation = sheetRequestSchema.safeParse(data);
  if (!validation.success) {
    const errorDetails = JSON.stringify(validation.error.flatten().fieldErrors);
    console.error(`[Add to Sheet] Invalid input data: ${errorDetails}`);
    return { success: false, error: 'Invalid input data for sheet.' };
  }

  const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;

  if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.error('[Add to Sheet] CRITICAL: Missing Google Sheets API credentials in environment variables.');
    return { success: false, error: 'Sheet integration is not configured on the server.' };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const { customerName, customerEmail, products, amount } = validation.data;
    const newRow = [
      new Date().toISOString(),
      customerName,
      customerEmail,
      products,
      amount.toFixed(2),
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return { success: true };

  } catch (error) {
    // Log the detailed error for debugging.
    console.error('[Add to Sheet] Failed to append to Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Provide a generic error message for the return value.
    return { success: false, error: `Failed to write to sheet: ${errorMessage}` };
  }
}


// =================================================================================
// SEND EMAIL LOGIC
// =================================================================================

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string().url(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  category: z.union([z.literal('Booklets'), z.literal('Wallpapers')]),
  downloadUrl: z.string().url(),
  disclaimer: z.string(),
  bundleIncludes: z.optional(z.array(z.string())),
  includedInBundle: z.optional(z.array(z.string())),
  originalPrice: z.optional(z.number()),
});

const emailRequestSchema = z.object({
  to: z.string().email({ message: 'Invalid email address' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  items: z.array(productSchema).min(1, { message: 'At least one item is required' }),
});

export type EmailData = z.infer<typeof emailRequestSchema>;

function createEmailBody(name: string, items: Product[]): string {
    const productsHtml = items.map(item => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; display: flex; align-items: center; gap: 20px;">
            <img src="${item.imageUrl}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
            <div>
                <h3 style="margin-top: 0; font-size: 18px; color: #333;">${item.name}</h3>
                <p style="font-size: 14px; color: #555; margin-bottom: 15px;">${item.description.substring(0,120)}...</p>
                <a href="${item.downloadUrl}" style="display: inline-block; padding: 10px 15px; background-color: #e83e8c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Now</a>
            </div>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff9f9;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://i.postimg.cc/YS91wKqP/Pink-Blush-Circle-Creative-Logo-Design.png" alt="Cuddleia Logo" style="width: 80px; height: 80px; border-radius: 50%;">
                <h1 style="color: #e83e8c; font-size: 28px; margin-top: 10px;">Cuddleia</h1>
            </div>
            <h2 style="font-size: 24px; color: #333;">Thank you for your order, ${name}!</h2>
            <p>We're so excited for you to enjoy your new digital goodies. Here are the download links for the items you purchased:</p>
            
            ${productsHtml}

            <div style="margin-top: 30px; padding: 20px; text-align: center; background-color: #fff0f5; border-radius: 8px;">
                <h3 style="margin-top: 0; font-size: 20px; color: #333;">Join Our Community!</h3>
                <p>Connect with other sisters, share inspiration, and get updates by joining our cozy corner on Telegram.</p>
                <a href="https://t.me/+Tt1wP2OgPBE1NjU1" style="display: inline-block; padding: 12px 20px; background-color: #0088cc; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Join on Telegram</a>
            </div>

            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to reply to this email.</p>
            <p>With love,<br>The Cuddleia Team</p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #aaa;">
                <p style="font-weight: bold; color: #888;">Terms of Use:</p>
                <p>All digital products purchased from Cuddleia are for personal use only. You are not permitted to resell, redistribute, or share these files in any form. All rights are reserved by Cuddleia.</p>
                <p style="margin-top: 20px;">Cuddleia | Cozy Digital Goods with Heart</p>
            </div>
        </div>
    `;
}


export async function sendProductEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  const ZOHO_EMAIL = process.env.ZOHO_MAIL_USER;
  const ZOHO_PASSWORD = process.env.ZOHO_MAIL_PASS;

  if (!ZOHO_EMAIL || !ZOHO_PASSWORD) {
      console.error('[Email] CRITICAL: Missing Zoho Mail credentials in environment variables.');
      return { success: false, error: 'Email server is not configured.' };
  }

  const validation = emailRequestSchema.safeParse(data);
  if (!validation.success) {
      const errorDetails = JSON.stringify(validation.error.flatten().fieldErrors);
      console.error(`[Email] Invalid email data: ${errorDetails}`);
      return { success: false, error: `Invalid email data. ${errorDetails}` };
  }

  const { to, subject, name, items } = validation.data;

  try {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
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
    return { success: true };

  } catch (error) {
    console.error('[Email] Email sending error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Failed to send email: ${errorMessage}` };
  }
}


// =================================================================================
// SEND TELEGRAM NOTIFICATION LOGIC
// =================================================================================

const telegramRequestSchema = z.object({
  message: z.string(),
});

type TelegramData = z.infer<typeof telegramRequestSchema>;

export async function sendTelegramNotification(data: TelegramData): Promise<{ success: boolean; error?: string }> {
  const validation = telegramRequestSchema.safeParse(data);
  if (!validation.success) {
    console.error('[Telegram Notify] Invalid input:', validation.error.flatten().fieldErrors);
    return { success: false, error: 'Invalid input' };
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[Telegram Notify] CRITICAL: Missing Telegram Bot Token or Chat ID in environment variables.');
    return { success: false, error: 'Telegram integration not configured on the server.' };
  }

  try {
    const { message } = validation.data;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `API Error: ${JSON.stringify(errorData)}`;
        console.error(`[Telegram Notify] Failed to send Telegram message. ${errorMessage}`);
        return { success: false, error: `Failed to send Telegram message: ${errorMessage}`};
    }
    
    console.log('[Telegram Notify] Successfully sent Telegram message.');
    return { success: true };

  } catch (error) {
    console.error('[Telegram Notify] Error sending Telegram notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Failed to send notification: ${errorMessage}` };
  }
}

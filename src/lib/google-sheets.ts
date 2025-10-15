// This is a server-side file.
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!SPREADSHEET_ID || !GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY) {
    console.warn("Google Sheets environment variables are not fully configured. Sales logging will be disabled.");
}

const auth = new JWT({
    email: GOOGLE_SHEETS_CLIENT_EMAIL,
    key: GOOGLE_SHEETS_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export interface SalesData {
    date: string;
    name: string;
    email: string;
    product: string;
    total: string;
    paymentMethod: string;
}

export async function appendToSheet(data: SalesData) {
    if (!SPREADSHEET_ID || !GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY) {
        // Silently fail if not configured to not break the checkout flow
        return;
    }

    const range = 'Sheet1!A:F'; // Assuming data is in Sheet1, columns A to F
    const values = [
        [data.date, data.name, data.email, data.product, data.total, data.paymentMethod]
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });
        console.log(`Appended sales data to Google Sheet for email: ${data.email}`);
    } catch (error) {
        console.error('Error appending data to Google Sheets:', error);
        // Do not throw error to ensure this doesn't break the main checkout flow
    }
}

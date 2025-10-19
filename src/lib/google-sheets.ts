
import { google } from 'googleapis';

// Define the shape of the data that can be appended
export type SheetRow = (string | number | null)[];

/**
 * Appends a new row of data to the specified Google Sheet.
 * @param sheetName - The name of the sheet (tab) to append to.
 * @param row - An array of values to append as a new row.
 */
export async function appendToSheet(sheetName: string, row: SheetRow) {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
      console.warn('Google Sheets environment variables are not fully configured. Skipping sheet append.');
      return;
    }

    // Authenticate with the Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Append the row to the specified sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [row],
      },
    });

  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    // Depending on requirements, you might want to throw the error
    // or handle it silently. For now, we log it.
  }
}


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
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId || !serviceAccountEmail || !privateKey) {
      console.warn('Google Sheets environment variables are not fully configured. Skipping sheet append.');
      // Throw an error to be caught by the calling function
      throw new Error('Google Sheets environment variables not configured.');
    }

    // Authenticate with the Google Sheets API using JWT
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets'],
    );

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log(`[Google Sheets] Authenticated. Attempting to append to: ${sheetName}`);
    
    // Append the row to the specified sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row],
      },
    });

    console.log(`[Google Sheets] Append successful. Status: ${response.status}`);

  } catch (error: any) {
    console.error('[Google Sheets] Error appending to sheet:', error.message);
    // Re-throw the error so the calling function knows the operation failed.
    throw new Error(`Failed to write to Google Sheet: ${error.message}`);
  }
}

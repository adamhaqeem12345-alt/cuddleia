
import { google } from 'googleapis';

// Define the shape of the data that can be appended
export type SheetRow = (string | number | null)[];

interface AppendResult {
  success: boolean;
  error?: string;
}

/**
 * Appends a new row of data to the specified Google Sheet.
 * @param sheetName - The name of the sheet (tab) to append to.
 * @param row - An array of values to append as a new row.
 * @returns An object indicating success or failure with an error message.
 */
export async function appendToSheet(sheetName: string, row: SheetRow): Promise<AppendResult> {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId || !serviceAccountEmail || !privateKey) {
      const errorMsg = 'Google Sheets environment variables are not fully configured.';
      console.warn(`[Google Sheets] ${errorMsg}`);
      return { success: false, error: errorMsg };
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

    if (response.status === 200) {
        console.log(`[Google Sheets] Append successful.`);
        return { success: true };
    } else {
        const errorMsg = `Google Sheets API responded with status: ${response.status}`;
        console.error(`[Google Sheets] ${errorMsg}`);
        return { success: false, error: errorMsg };
    }

  } catch (error: any) {
    const errorMsg = `Failed to write to Google Sheet: ${error.message}`;
    console.error('[Google Sheets] Error appending to sheet:', error);
    // Return the specific error message
    return { success: false, error: errorMsg };
  }
}

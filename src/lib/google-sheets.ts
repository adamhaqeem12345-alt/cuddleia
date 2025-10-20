
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Google Sheets API credentials are not set in environment variables.');
  }

  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    SCOPES
  );

  return auth;
}

export async function appendToSheet(sheetName: string, data: any[]) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID is not set in environment variables.');
    }
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

    console.log(`Successfully wrote to Google Sheet: ${sheetName}`);

  } catch (error: any) {
    console.error(`Failed to write to Google Sheet '${sheetName}':`, error.message);
    // Re-throw the error so the calling function can handle it, e.g., by sending a notification.
    throw error;
  }
}

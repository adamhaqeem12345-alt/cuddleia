
import { google } from 'googleapis';
import { sendTelegramNotification } from './telegram';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!privateKey || !clientEmail || !sheetId) {
    throw new Error('Google Sheets API credentials (private key, client email, or sheet ID) are not set correctly in environment variables.');
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
    // Re-throw the error so the calling function can handle it.
    throw error;
  }
}

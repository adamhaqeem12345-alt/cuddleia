
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// This function is now designed to work in serverless environments
// where process.env might not be populated from a .env file at runtime.
// The Next.js build process will replace process.env variables.
async function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    // This error will be thrown at build time or runtime if the variables are not set in the environment.
    throw new Error('Google Sheets API credentials (private key or client email) are not set correctly in environment variables.');
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
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
      throw new Error('Google Sheet ID is not set in environment variables.');
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
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
    throw error; // Re-throw so the calling API route can handle it (e.g., send a notification)
  }
}

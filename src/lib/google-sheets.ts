
import { google } from 'googleapis';
import { sendTelegramNotification } from './telegram';

// Read variables at the top level. Next.js will replace these with their values at build time.
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Perform a check at the module level. If variables are missing, the app will fail to build.
if (!privateKey || !clientEmail || !spreadsheetId) {
  const missingVars = [
    !privateKey && 'GOOGLE_PRIVATE_KEY',
    !clientEmail && 'GOOGLE_CLIENT_EMAIL',
    !spreadsheetId && 'GOOGLE_SHEET_ID',
  ].filter(Boolean).join(', ');

  // This error will appear during the build process if variables are not set.
  throw new Error(`CRITICAL ERROR: The following Google Sheets environment variables are missing: ${missingVars}. The application cannot start.`);
}

async function getAuthClient() {
  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return auth;
}

export async function appendToSheet(sheetName: string, data: any[]) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId!, // The check above ensures this is defined
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

  } catch (error: any) {
    console.error(`Google Sheets Error: Failed to write to sheet '${sheetName}':`, error.message);
    // Re-throw the error so the calling API route can handle it
    throw error;
  }
}


import { google } from 'googleapis';

async function getAuthClient() {
    const credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.client_email || !credentials.private_key) {
        throw new Error("Google Sheets API credentials are not set in environment variables.");
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth.getClient();
}

/**
 * Appends a row of data to a specified Google Sheet.
 * @param spreadsheetId - The ID of the Google Spreadsheet.
 * @param range - The A1 notation of a range to search for a logical table of data.
 * @param values - A 2D array of values to append.
 */
export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        return response.data;
    } catch (error: any) {
        console.error('Error appending to Google Sheet:', error.message);
        // Re-throw the error to be handled by the calling function
        throw new Error(`Failed to write to Google Sheet: ${error.message}`);
    }
}

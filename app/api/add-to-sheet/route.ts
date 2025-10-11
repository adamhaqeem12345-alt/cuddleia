
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { z } from 'zod';

const sheetRequestSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  products: z.string(),
  amount: z.number(),
});

export async function POST(req: NextRequest) {
  // 1. Validate Input
  let validatedData;
  try {
    const body = await req.json();
    const validation = sheetRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    validatedData = validation.data;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. Check for environment variables
  const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;

  if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.error('CRITICAL: Missing Google Sheets API credentials in environment variables.');
    // We return 200 OK so we don't block the checkout flow, but we log the critical error.
    return NextResponse.json({ message: 'Sheet integration not configured, but proceeding.' }, { status: 200 });
  }

  try {
    // 3. Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'), // Important for Vercel env vars
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 4. Prepare data for the new row
    const { customerName, customerEmail, products, amount } = validatedData;
    const newRow = [
      new Date().toISOString(),
      customerName,
      customerEmail,
      products,
      amount.toFixed(2),
    ];
    
    // 5. Append the new row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E', // The name of your sheet and the columns to append to
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow],
      },
    });

    return NextResponse.json({ message: 'Successfully added to sheet' }, { status: 200 });

  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
    // Again, return 200 OK to not break the user flow, but log the failure.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to write to sheet', details: errorMessage }, { status: 200 });
  }
}

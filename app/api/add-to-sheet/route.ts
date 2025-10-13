
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const sheetRequestSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  products: z.string(),
  amount: z.number(),
});

type SheetData = z.infer<typeof sheetRequestSchema>;

export async function addOrderToSheet(data: SheetData): Promise<{ success: boolean; error?: string }> {
  const validation = sheetRequestSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid input data for sheet.' };
  }

  const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;

  if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.error('CRITICAL: Missing Google Sheets API credentials in environment variables.');
    return { success: false, error: 'Sheet integration is not configured on the server.' };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const { customerName, customerEmail, products, amount } = validation.data;
    const newRow = [
      new Date().toISOString(),
      customerName,
      customerEmail,
      products,
      amount.toFixed(2),
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: `Failed to write to sheet: ${errorMessage}` };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await addOrderToSheet(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully added to sheet' }, { status: 200 });

  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

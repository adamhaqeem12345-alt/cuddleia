
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      console.error("Send email failed: Missing required fields (to, subject, html).");
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 });
    }

    await sendEmail({ to, subject, html });

    return NextResponse.json({ message: "Email sent successfully." });

  } catch (error) {
    console.error("Error in send-email route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to send email.", details: errorMessage }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // This is a minimal implementation to force a non-zero build.
  console.log("API ROUTE: /api/send-email HIT");
  // No email logic is performed.
  return NextResponse.json({ message: "Email API is deployed." });
}

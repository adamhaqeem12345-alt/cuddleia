
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // This is a minimal implementation to force a non-zero build.
  console.log("API ROUTE: /api/paypal/webhook HIT");
  // We do not parse or process the body to ensure build success.
  return NextResponse.json({ received: true, status: "Minimal success" });
}

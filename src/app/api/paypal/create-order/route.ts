
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // This is a minimal implementation to force a non-zero build.
  console.log("API ROUTE: /api/paypal/create-order HIT");
  try {
    // We are not processing the request body, just returning a static response.
    // This proves the route is deployable.
    const minimalOrder = {
      id: "MINIMAL_ORDER_ID_FROM_BUILD_FIX",
      status: "CREATED",
    };
    return NextResponse.json(minimalOrder);
  } catch (error: any) {
    console.error("This should not happen in minimal mode:", error);
    return NextResponse.json({ error: "Minimal mode error" }, { status: 500 });
  }
}

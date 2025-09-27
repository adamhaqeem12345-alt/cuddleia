import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }
    
    const result = await captureOrder(orderId);

    if (result.success) {
      return NextResponse.json({ message: "Payment captured successfully.", products: result.products });
    } else {
      return NextResponse.json({ error: "Failed to capture payment." }, { status: 400 });
    }

  } catch (error: any)
    console.error("API /capture-order Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." }, 
      { status: 500 }
    );
  }
}

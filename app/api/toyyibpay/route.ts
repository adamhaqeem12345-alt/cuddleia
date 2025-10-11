
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/products';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string().url(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  category: z.union([z.literal('Booklets'), z.literal('Wallpapers')]),
  downloadUrl: z.string().url(),
  disclaimer: z.string(),
});

const toyyibPayRequestSchema = z.object({
  items: z.array(productSchema).min(1, { message: 'At least one item is required' }),
  total: z.number().positive({ message: 'Total must be a positive number' }),
  customerName: z.string().min(1, { message: 'Customer name is required'}),
  customerEmail: z.string().email({ message: 'A valid customer email is required'}),
});

export async function POST(req: NextRequest) {
  // Read environment variables inside the function to ensure they are available at runtime.
  const TOYYIBPAY_SECRET = process.env.TOYYIBPAY_SECRET;
  const TOYYIBPAY_CATEGORY_CODE = process.env.TOYYIBPAY_CATEGORY_CODE;

  if (!TOYYIBPAY_SECRET || !TOYYIBPAY_CATEGORY_CODE) {
    console.error('CRITICAL: Missing ToyyibPay secret key or category code in environment variables.');
    return NextResponse.json({ error: 'Payment provider is not configured. Please contact support.' }, { status: 500 });
  }
    
  try {
    const body = await req.json();
    
    const validation = toyyibPayRequestSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { items, total, customerName, customerEmail } = validation.data;
    
    const returnUrl = 'https://www.cuddleia.com/checkout/success';
    const callbackUrl = 'https://www.cuddleia.com/api/webhook/toyyibpay';
    
    const orderId = uuidv4();
    
    const productIds = items.map(item => item.id).join(',');
    const billName = `Cuddleia Order ${orderId.substring(0, 8)}`;
    const billDescription = `Items:${productIds}`;
    const billAmountInCents = Math.round(total * 100);

    const params = new URLSearchParams({
      userSecretKey: TOYYIBPAY_SECRET,
      categoryCode: TOYYIBPAY_CATEGORY_CODE,
      billName: billName,
      billDescription: billDescription,
      billPriceSetting: '1',
      billPayorInfo: '1',
      billAmount: billAmountInCents.toString(),
      billReturnUrl: returnUrl,
      billCallbackUrl: callbackUrl,
      billExternalReferenceNo: orderId,
      billTo: customerName,
      billEmail: customerEmail,
      billPhone: '0123456789',
      billPaymentChannel: '0', // 0 for FPX Only
      billSplitPayment: '0', // Added this parameter to fix FPX issues
    });

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
        console.error('ToyyibPay API Error (Non-200 Status):', response.status, responseText);
        return NextResponse.json({ error: `ToyyibPay API returned status ${response.status}. Response: ${responseText}` }, { status: 500 });
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch(e) {
        console.error('Failed to parse ToyyibPay JSON response:', responseText);
        return NextResponse.json({ error: 'Received an invalid response from ToyyibPay.'}, { status: 500 });
    }
    
    if (data && Array.isArray(data) && data.length > 0 && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = 'https://toyyibpay.com/' + billCode;
      return NextResponse.json({ paymentUrl });
    } else {
      console.error('ToyyibPay API Error (but 200 OK):', data);
      const errorMessage = data && data.length > 0 && (data[0].msg || data[0].status) ? (data[0].msg || data[0].status) : 'Unknown API error, response did not contain BillCode.';
      return NextResponse.json({ error: `Could not create ToyyibPay bill: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create Toyyibpay bill:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `There was an issue connecting to our payment provider: ${errorMessage}` }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import ipn from 'paypal-ipn';
import { processPaypalIPN } from '@/app/actions';

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
    console.log('[PayPal IPN] Received POST request.');
    
    const isVerified = await new Promise<boolean>((resolve) => {
      const params = new URLSearchParams(rawBody);
      params.append('cmd', '_notify-validate');
      const ipnData = Object.fromEntries(params.entries());

      // The 'paypal-ipn' library types are a bit off, we need to cast the options
      const options = { allow_sandbox: process.env.PAYPAL_SANDBOX === 'true' };
      
      ipn.verify(ipnData, options as any, (err: Error | null, msg: string) => {
        if (err) {
          console.error('[PayPal IPN] Verification Error:', err);
          resolve(false);
        } else {
          console.log('[PayPal IPN] Verification Message:', msg);
          resolve(msg === 'VERIFIED');
        }
      });
    });

    if (isVerified) {
      console.log('[PayPal IPN] Successfully verified.');
      // The library parses the body string into an object, but we already did.
      const ipnData = ipn.parse(rawBody);
      
      // Process the verified IPN data asynchronously.
      processPaypalIPN(ipnData).catch(err => {
          console.error("[PayPal IPN] Error in background processing:", err);
      });
    } else {
      console.warn('[PayPal IPN] Verification failed. Ignoring request.');
    }
    
    // Respond to PayPal with a 200 OK to acknowledge receipt of the IPN.
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('[PayPal IPN] Error handling IPN POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

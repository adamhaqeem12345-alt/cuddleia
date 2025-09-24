
import { NextRequest, NextResponse } from 'next/server';
import ipn from 'paypal-ipn';
import { processPaypalIPN } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    console.log('Received PayPal IPN POST request.');
    
    // The `paypal-ipn` library requires the raw body text.
    // It will then make a post back to PayPal to verify the data.
    const isVerified = await new Promise<boolean>((resolve, reject) => {
      // The 'paypal-ipn' library types are a bit off, we need to cast the options
      const options = { allow_sandbox: process.env.PAYPAL_SANDBOX === 'true' }; 
      ipn.verify(body, options as any, (err: Error | null, msg: string) => {
        if (err) {
          console.error('PayPal IPN Verification Error:', err);
          reject(err);
        } else {
          console.log('PayPal IPN Verification Message:', msg);
          if (msg === 'VERIFIED') {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });

    if (isVerified) {
      console.log('PayPal IPN successfully verified.');
      // The library parses the body string into an object.
      const ipnData = ipn.parse(body);
      // Process the verified IPN data asynchronously.
      processPaypalIPN(ipnData).catch(err => {
          console.error("Error in background processing of PayPal IPN:", err);
      });
    } else {
      console.warn('PayPal IPN verification failed. Ignoring request.');
    }
    
    // Respond to PayPal with a 200 OK to acknowledge receipt of the IPN.
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Error handling PayPal IPN:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

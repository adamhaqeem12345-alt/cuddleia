
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { processPaypalSuccess } from '@/app/actions';

function SuccessContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // PayPal's "return" URL does not have server-side reliability like IPN or webhooks.
    // We get the payment details from the query params when the user is redirected back.
    // This is less secure than a webhook, but simpler for this use case.
    const method = searchParams.get('method');
    const custom = searchParams.get('custom'); // This is from our original PayPal button data

    // Only process if it's a PayPal return and we have the custom data.
    // ToyyibPay is handled by its server-to-server callback.
    if (method === 'paypal' && custom) {
      console.log('Processing PayPal success on client...');
      // We call the server action to record the sale and send the email.
      // Don't await, let it run in the background.
      processPaypalSuccess(custom);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg animate-fade-in">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="mt-2 text-lg">Thank you for your order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border border-primary/50 bg-primary/10 p-4">
               <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-headline text-lg text-primary-foreground">Check Your Email</h3>
                    <p className="text-muted-foreground">
                        We've sent the download link for your digital product to your email address. If you don't see it, please check your spam folder.
                    </p>
                  </div>
               </div>
            </div>
          
          <Button asChild size="lg" className="w-full">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
          <div className="flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}

    
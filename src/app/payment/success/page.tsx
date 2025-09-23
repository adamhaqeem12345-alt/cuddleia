
'use client';

import { Suspense } from 'react';
import { CheckCircle, Mail, Loader2, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SuccessContent() {
  // Fulfillment is now handled entirely by server-to-server webhooks (ToyyibPay callback & PayPal IPN).
  // This page is just a confirmation for the user. The email with the download link
  // will be sent automatically by the server once payment is confirmed.

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg animate-fade-in border-primary/20">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PartyPopper className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="mt-2 text-lg">Thank you for your order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border border-primary/50 bg-primary/10 p-4">
               <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-headline text-lg text-primary-foreground/90 text-left">Check Your Email</h3>
                    <p className="text-muted-foreground text-left">
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

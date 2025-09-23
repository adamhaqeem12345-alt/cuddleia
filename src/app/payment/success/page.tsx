
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const payment_method = searchParams.get('utm_medium'); // Check if it's from paypal

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
          {payment_method === 'paypal' ? (
            <div className="rounded-md border border-accent/50 bg-accent/10 p-4">
               <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-6 w-6 text-accent" />
                  <div>
                    <h3 className="font-headline text-lg text-accent-foreground">Check Your Email</h3>
                    <p className="text-muted-foreground">
                        We are processing your order. You will receive an email with the download link shortly. Please allow a few minutes for this to arrive.
                    </p>
                  </div>
               </div>
            </div>
          ) : (
             <div className="rounded-md border border-primary/50 bg-primary/10 p-4">
               <div className="flex items-start gap-4">
                  <Package className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-headline text-lg text-primary-foreground">Your Product is on its Way!</h3>
                    <p className="text-muted-foreground">
                        We've sent the download link for your digital product to your email address. If you don't see it, please check your spam folder.
                    </p>
                  </div>
               </div>
            </div>
          )}
          
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
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}

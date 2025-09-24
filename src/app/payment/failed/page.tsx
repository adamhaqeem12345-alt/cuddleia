
'use client';

import { Suspense } from 'react';
import { XCircle, Loader2, Frown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FailedContent() {
    const searchParams = useSearchParams();
    const method = searchParams.get('method');
    const billcode = searchParams.get('billcode'); // from ToyyibPay
    const token = searchParams.get('token'); // from PayPal

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg animate-fade-in border-destructive/20 rounded-2xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Frown className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl text-destructive">Payment Failed</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">Unfortunately, your payment could not be processed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <p className="text-muted-foreground">
                This might have been due to a cancellation or a problem with the payment provider. Please try again or contact us if the problem persists.
            </p>
          
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/products">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
          <div className="flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
            <FailedContent />
        </Suspense>
    )
}

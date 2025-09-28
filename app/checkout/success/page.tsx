
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    if (!orderId) {
         return (
            <AnimateIn className="w-full max-w-3xl text-center">
               <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
               <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                   Invalid Success Page Access
               </h1>
               <p className="mt-4 text-lg text-muted-foreground">
                   This page should only be accessed after a successful payment. If you have completed a purchase and are seeing this, please check your email for an order confirmation.
               </p>
               <div className="mt-10">
                   <Button asChild size="lg" className="rounded-full font-bold">
                       <Link href="/products">Explore Products</Link>
                   </Button>
               </div>
           </AnimateIn>
       )
    }

    return (
       <AnimateIn className="w-full max-w-3xl text-center">
           <CheckCircle className="mx-auto h-20 w-20 text-primary" />
           <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
               Thank You For Your Order!
           </h1>
           <p className="mt-4 text-lg text-muted-foreground">
               Your payment was successful and your order is complete. We've sent a confirmation email to you with your download links.
           </p>
            <div className="mt-6 bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground">Your Order ID is: <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded">{orderId}</span></p>
            </div>
           <p className="mt-6 text-sm text-muted-foreground">
                If you don't see the email within a few minutes, please be sure to check your spam or junk folder.
           </p>
           <div className="mt-10">
               <Button asChild size="lg" className="rounded-full font-bold">
                   <Link href="/products">Continue Shopping</Link>
               </Button>
           </div>
       </AnimateIn>
    )
}

export default function SuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center min-h-[60vh]">
            <Suspense>
                <SuccessContent />
            </Suspense>
        </div>
    );
}

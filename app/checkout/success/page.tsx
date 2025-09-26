'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AnimateIn } from '@/components/animate-in';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
            <AnimateIn>
                <div className="bg-background max-w-2xl w-full text-center p-8 md:p-12 rounded-2xl border shadow-lg">
                    <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
                    <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                        Payment Successful!
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Thank you for your purchase. Your order is complete and your digital goods are ready.
                    </p>
                    {orderId && (
                        <div className="mt-6 text-sm text-muted-foreground">
                            <p>Your Order ID is: <span className="font-mono bg-muted p-1 rounded-md">{orderId}</span></p>
                        </div>
                    )}
                    <div className="mt-8">
                        <p className="text-muted-foreground">
                            A confirmation email with your download links has been sent to your PayPal email address.
                        </p>
                         <p className="text-muted-foreground mt-2">
                            If you have any issues, please reply to that email.
                        </p>
                    </div>
                    <div className="mt-10">
                        <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                            <Link href="/products">
                                <Download className="mr-2 h-5 w-5" />
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
            </AnimateIn>
        </div>
    );
}


export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="text-center p-24">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';

function SuccessContent() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
            <AnimateIn>
                <div className="bg-background max-w-3xl w-full text-center p-8 md:p-12 rounded-2xl border shadow-lg">
                    <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
                    <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                        Order Information Unavailable
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        There was an issue retrieving your order details because the payment system is currently offline. If you believe you were charged, please contact us.
                    </p>
                     <div className="mt-10">
                        <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                            <Link href="/products">
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
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}

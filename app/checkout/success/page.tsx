
'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AnimateIn } from '@/components/animate-in';

function SuccessContent() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
            <AnimateIn>
                <div className="bg-background max-w-2xl w-full text-center p-8 md:p-12 rounded-2xl border shadow-lg">
                    <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
                    <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                        Thank You!
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        While payments are currently disabled, we appreciate your interest.
                    </p>
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
        // Suspense is crucial for pages that use `useSearchParams`.
        <Suspense fallback={
             <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-20 w-20 text-primary animate-spin" />
             </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}

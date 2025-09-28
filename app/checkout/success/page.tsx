
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';

function SuccessContent() {
    return (
        <AnimateIn className="w-full max-w-3xl text-center">
           <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
           <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
               Invalid Page
           </h1>
           <p className="mt-4 text-lg text-muted-foreground">
               This page is not accessible because the checkout system is currently disabled.
           </p>
           <div className="mt-10">
               <Button asChild size="lg" className="rounded-full font-bold">
                   <Link href="/products">Explore Products</Link>
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

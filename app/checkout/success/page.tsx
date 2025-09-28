
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';

function SuccessContent() {
    return (
       <AnimateIn className="w-full max-w-3xl text-center">
           <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
           <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
               Invalid Page Access
           </h1>
           <p className="mt-4 text-lg text-muted-foreground">
               This page is only accessible after a successful purchase. As checkout is currently disabled, this page cannot be accessed.
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

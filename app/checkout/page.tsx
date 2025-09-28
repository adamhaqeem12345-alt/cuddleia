
'use client';

import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {

    return (
        <AnimateIn>
            <div className="container mx-auto px-4 py-24 text-center">
                <Construction className="mx-auto h-24 w-24 text-primary/50" />
                <h1 className="mt-8 font-headline text-4xl font-bold text-foreground">
                    Checkout is Under Construction
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                    We are currently performing maintenance on our checkout system. Please check back soon!
                </p>
                <div className="mt-10">
                   <Button asChild size="lg" className="rounded-full font-bold">
                       <Link href="/products">Continue Shopping</Link>
                   </Button>
               </div>
            </div>
        </AnimateIn>
    );
}

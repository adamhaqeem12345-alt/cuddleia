
'use client';

import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';

export default function SuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
            <AnimateIn>
                <div className="bg-background max-w-2xl w-full text-center p-8 md:p-12 rounded-2xl border shadow-lg">
                    <ShoppingBag className="mx-auto h-20 w-20 text-primary" />
                    <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                        Thanks for visiting!
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our store is currently being updated. Please check back soon!
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

'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CheckoutPage() {
    return (
        <AnimateIn>
            <div className="bg-rose-50/30">
                <div className="container mx-auto px-4 py-16 sm:py-24">
                    <div className="max-w-2xl mx-auto text-center">
                        <AlertTriangle className="mx-auto h-20 w-20 text-amber-500" />
                        <h1 className="mt-6 font-headline text-5xl font-bold text-foreground">
                            Checkout Unavailable
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Our checkout system is temporarily disabled. We apologize for the inconvenience. Please check back later.
                        </p>
                        <div className="mt-12">
                            <Button asChild variant="ghost">
                                <Link href="/cart">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Return to Cart
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimateIn>
    );
}


'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import type { ProductInfo } from '@/lib/email';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [downloadLinks, setDownloadLinks] = useState<ProductInfo[]>([]);

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            // If there's no token, the user likely visited this page directly.
            // Redirect them to a safe page.
            router.push('/products');
            return;
        }

        async function capturePayment() {
            try {
                const response = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to capture payment.');
                }
                
                setDownloadLinks(data.products || []);
                setStatus('success');
                clearCart();
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
                setStatus('error');
            }
        }

        capturePayment();
    }, [searchParams, router, clearCart]);

    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-20 w-20 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Finalizing your order...</p>
            </div>
        );
    }
    
     if (status === 'error') {
        return (
            <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
                 <AnimateIn>
                    <div className="bg-background max-w-2xl w-full text-center p-8 md:p-12 rounded-2xl border shadow-lg">
                        <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
                        <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                            Payment Failed
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            We were unable to process your payment.
                        </p>
                        <p className="mt-2 text-sm text-destructive-foreground bg-destructive/20 p-3 rounded-md">{error}</p>
                        <div className="mt-10">
                            <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                                <Link href="/cart">
                                    Return to Cart
                                </Link>
                            </Button>
                        </div>
                    </div>
                </AnimateIn>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
            <AnimateIn>
                <div className="bg-background max-w-2xl w-full p-8 md:p-12 rounded-2xl border shadow-lg">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
                        <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                            Thank You!
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Your order is complete. Your download links are below and have also been sent to your email.
                        </p>
                    </div>

                    <div className="mt-10 space-y-4">
                        <h2 className="font-headline text-2xl font-bold text-center">Your Downloads</h2>
                        {downloadLinks.map(product => (
                             <div key={product.name} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                                <div>
                                    <p className="font-semibold text-secondary-foreground">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                                </div>
                                <Button asChild size="sm">
                                    <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Button asChild size="lg" variant="outline" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
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
        <Suspense fallback={
             <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-20 w-20 text-primary animate-spin" />
                 <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
             </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}

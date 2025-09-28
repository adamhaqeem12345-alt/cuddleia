'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, AlertTriangle, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';
import type { ProductInfo } from '@/lib/email';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) {
            setError('No order ID found. Your payment was likely successful, but we cannot retrieve your downloads automatically. Please check your email.');
            setStatus('error');
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                // We re-use the capture endpoint which is idempotent
                // It will fetch the order details if already captured
                const res = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to retrieve order details.');
                }
                
                const data = await res.json();
                setProducts(data.products);
                setStatus('success');

            } catch (err: any) {
                console.error("Fetch order details error:", err);
                setError("We couldn't retrieve your download links right now, but your payment was successful. Please check your email for the order confirmation and download links.");
                setStatus('error');
            }
        };

        fetchOrderDetails();
    }, [orderId]);


    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center">
            <AnimateIn>
                <div className="bg-background max-w-3xl w-full text-center p-8 md:p-12 rounded-2xl border shadow-lg">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="mx-auto h-20 w-20 text-primary animate-spin" />
                            <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                                Verifying Your Order...
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Please wait while we confirm your payment and prepare your downloads.
                            </p>
                        </>
                    )}

                     {status === 'error' && (
                        <>
                            <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
                            <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                                There was an issue
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                                {error}
                            </p>
                             <div className="mt-10">
                                <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                                    <Link href="/products">
                                        Continue Shopping
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <ShoppingBag className="mx-auto h-20 w-20 text-primary" />
                            <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                                Thank You For Your Order!
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Your digital goods are ready. A confirmation has also been sent to your email.
                            </p>
                            
                            <div className="mt-10 text-left bg-gray-50/80 p-6 rounded-xl border">
                                <h3 className="text-xl font-headline font-semibold mb-4">Your Downloads</h3>
                                <div className="space-y-4">
                                    {products.map(product => (
                                        <div key={product.name} className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <FileText className="h-6 w-6 text-primary" />
                                                <div>
                                                    <p className="font-semibold">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                                                </div>
                                            </div>
                                            <Button asChild>
                                                <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" /> Download
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mt-10">
                                <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                                    <Link href="/products">
                                        Continue Shopping
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
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
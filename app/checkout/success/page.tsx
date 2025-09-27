
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';

// This component handles capturing the payment after the user approves it on PayPal.
function SuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    
    // Get order details from the URL query parameters set by PayPal.
    const orderId = searchParams.get('token'); // PayPal uses 'token' for the Order ID in the return URL
    const payerId = searchParams.get('PayerID'); // PayPal uses 'PayerID' for the Payer ID

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Ensure this effect runs only once and only when we have an orderId.
        if (!orderId) {
            setError('No order ID found. Your payment cannot be confirmed.');
            setStatus('error');
            return;
        }

        const capturePayment = async () => {
            try {
                // Call the backend API to capture the order.
                const response = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderID: orderId }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // Use the error message from our API if available.
                    throw new Error(data.error || 'Failed to finalize your payment.');
                }
                
                // Payment is successfully captured.
                setStatus('success');
                // Clear the shopping cart now that the purchase is complete.
                clearCart();

            } catch (err: any) {
                console.error("Failed to capture payment:", err);
                setError(err.message || 'An unknown error occurred while processing your payment.');
                setStatus('error');
            }
        };

        capturePayment();
    // Disable ESLint warning because we want this effect to run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);


    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <AnimateIn>
                    <Loader2 className="mx-auto h-20 w-20 text-primary animate-spin" />
                    <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                        Finalizing Your Order...
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Please wait while we securely process your payment. Do not close this page.
                    </p>
                </AnimateIn>
            </div>
        );
    }

     if (status === 'error') {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <AnimateIn>
                    <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
                    <h1 className="mt-6 text-3xl font-bold text-destructive">Payment Processing Failed</h1>
                    <p className="text-muted-foreground mt-4">{error}</p>
                    <Button asChild className="mt-8">
                        <Link href="/cart">Return to Cart</Link>
                    </Button>
                </AnimateIn>
            </div>
        )
    }

    // --- Success State ---
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

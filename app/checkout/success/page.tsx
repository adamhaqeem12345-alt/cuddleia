'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertTriangle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';

type Status = 'verifying' | 'success' | 'error' | 'invalid';

interface OrderDetails {
    orderId: string;
    customerName: string;
    total: string;
    products: { name: string, downloadUrl: string }[]
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    
    const [status, setStatus] = useState<Status>('verifying');
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [errorMessage, setErrorMessage] = useState('An unknown error occurred.');

    const token = searchParams.get('token'); // PayPal Order ID
    
    useEffect(() => {
        if (!token) {
            setStatus('invalid');
            return;
        }

        async function verifyOrder() {
            try {
                const res = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: token }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to verify payment.');
                }
                
                setOrderDetails(data);
                setStatus('success');
                clearCart(); // Clear the cart only on successful verification

            } catch (error) {
                console.error('Verification Error:', error);
                setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred during verification.');
                setStatus('error');
            }
        }

        verifyOrder();
    }, [token, clearCart]);


    if (status === 'verifying') {
        return (
            <AnimateIn className="w-full max-w-3xl text-center">
                <Loader2 className="mx-auto h-20 w-20 text-primary animate-spin" />
                <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                    Verifying Your Payment...
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Please wait while we securely confirm your transaction. Do not close this page.
                </p>
            </AnimateIn>
        );
    }

    if (status === 'invalid') {
        return (
             <AnimateIn className="w-full max-w-3xl text-center">
                <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
                <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                    Invalid Order Link
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    The link is missing the required payment token. If you completed a purchase, please check your email for confirmation.
                </p>
                <div className="mt-10">
                    <Button asChild size="lg" className="rounded-full font-bold">
                        <Link href="/products">Explore Products</Link>
                    </Button>
                </div>
            </AnimateIn>
        )
    }

    if (status === 'error') {
        return (
            <AnimateIn className="w-full max-w-3xl text-center">
                <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
                <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                    Payment Verification Failed
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    {errorMessage} If you believe you were charged, please contact us with your PayPal transaction ID.
                </p>
                <div className="mt-10">
                    <Button asChild size="lg" className="rounded-full font-bold">
                        <Link href="/cart">Return to Cart</Link>
                    </Button>
                </div>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn className="w-full max-w-3xl text-center">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
            <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                Thank You, {orderDetails?.customerName}!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Your order (#{orderDetails?.orderId}) is complete. Your download links have been sent to your email and are also available below.
            </p>

            <div className="mt-8 text-left bg-gray-50/80 border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-headline font-semibold border-b pb-3">Your Digital Products</h2>
                {orderDetails?.products.map((product, index) => (
                     <div key={index} className="flex justify-between items-center">
                        <p className="font-semibold">{product.name}</p>
                        <Button asChild size="sm">
                            <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">Download</a>
                        </Button>
                    </div>
                ))}
            </div>
            
             <div className="mt-10">
                <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                    <Link href="/products">
                       <ShoppingCart className="mr-2 h-5 w-5" /> Continue Shopping
                    </Link>
                </Button>
            </div>
        </AnimateIn>
    );
}

export default function SuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 flex items-center justify-center min-h-[60vh]">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
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
    const { clearCart } = useCart();
    
    const [status, setStatus] = useState<Status>('invalid');
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [errorMessage, setErrorMessage] = useState('An unknown error occurred.');

    const payment_status = searchParams.get('status'); 
    
    useEffect(() => {
        if (payment_status === 'success') {
            setStatus('success');
            // In a real scenario, you'd fetch order details from your server
            // using a session ID or order ID from the query parameters.
            setOrderDetails({
                orderId: 'temp-123',
                customerName: 'Valued Customer',
                total: '$0.00',
                products: [],
            });
            clearCart();
        } else if (payment_status === 'error') {
            setStatus('error');
            setErrorMessage('The payment was canceled or failed.');
        } else {
             setStatus('invalid');
             setErrorMessage('The payment confirmation link is invalid or has expired.');
        }
    }, [payment_status, clearCart]);


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
                    Invalid Link
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    {errorMessage}
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
                    Payment Failed
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    {errorMessage} Please try again from your cart.
                </p>
                <div className="mt-10">
                    <Button asChild size="lg" className="rounded-full font-bold">
                        <Link href="/cart">Return to Cart</Link>
                    </Button>
                </div>
            </AnimateIn>
        );
    }

    // A generic success page until the new gateways are integrated
    return (
        <AnimateIn className="w-full max-w-3xl text-center">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
            <h1 className="mt-6 font-headline text-4xl md:text-5xl font-bold text-foreground">
                Thank You, {orderDetails?.customerName}!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Your order (#{orderDetails?.orderId}) is complete. Your download links will be sent to your email shortly.
            </p>
            
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

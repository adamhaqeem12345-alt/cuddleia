
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useEffect, useState, Suspense } from 'react';

const SuccessContent = () => {
    const { clearCart } = useCart();
    useEffect(() => {
        clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="flex justify-center mb-6">
                <CheckCircle className="h-24 w-24 text-green-500" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Thank you for your purchase. You will receive an email confirmation shortly with your order details and download links.
            </p>
            <Button asChild size="lg" className="rounded-full">
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </>
    );
};

const FailedContent = () => {
    return (
        <>
            <div className="flex justify-center mb-6">
                <XCircle className="h-24 w-24 text-destructive" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Payment Failed</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Unfortunately, we were unable to process your payment. Please try again or contact us if the problem persists.
            </p>
             <div className="flex gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full">
                    <Link href="/checkout">Try Again</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        </>
    );
};

const CanceledContent = () => {
    return (
        <>
            <div className="flex justify-center mb-6">
                <AlertCircle className="h-24 w-24 text-yellow-500" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Payment Canceled</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Your payment process was canceled. Your cart is still waiting for you if you'd like to try again.
            </p>
            <div className="flex gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full">
                    <Link href="/checkout">Back to Checkout</Link>
                </Button>
                 <Button asChild size="lg" variant="outline" className="rounded-full">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        </>
    );
}

function CheckoutStatusContent() {
    const searchParams = useSearchParams();
    const source = searchParams?.get('source');
    const confirmationError = searchParams?.get('confirmation_error');
    const [isPayPalLoading, setIsPayPalLoading] = useState(true);

    // This effect handles the initial loading state for PayPal redirects.
    useEffect(() => {
        if (source === 'paypal') {
            // Simulate a short delay to ensure all client-side scripts have run
            const timer = setTimeout(() => setIsPayPalLoading(false), 500);
            return () => clearTimeout(timer);
        } else {
            setIsPayPalLoading(false);
        }
    }, [source]);
    
    // Display a loader for PayPal payments while state is being synchronized
    if (source === 'paypal' && isPayPalLoading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Finalizing your order...</p>
            </div>
        )
    }
    
    // Handle PayPal success (and potential server confirmation errors)
    if (source === 'paypal') {
        if (confirmationError) {
             return (
                <>
                    <div className="flex justify-center mb-6">
                        <AlertCircle className="h-24 w-24 text-yellow-500" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Payment Complete, Confirmation Pending</h1>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                        Your payment was successful, but we had a temporary issue confirming your order on our server. Your download links have been sent to your email. If you don't receive them within 5 minutes, please contact us.
                    </p>
                    <Button asChild size="lg" className="rounded-full">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </>
            );
        }
        return <SuccessContent />;
    }

    // Default to success if no specific status is found, to handle edge cases gracefully.
    return <SuccessContent />;
}

export default function CheckoutStatusPage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
           <Suspense fallback={<div className="flex flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-muted-foreground">Loading payment status...</p></div>}>
             <CheckoutStatusContent />
           </Suspense>
        </div>
    );
}

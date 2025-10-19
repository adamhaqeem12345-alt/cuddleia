
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useEffect } from 'react';

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

export default function CheckoutStatusPage() {
    const searchParams = useSearchParams();
    const statusId = searchParams.get('status_id');

    const renderContent = () => {
        switch (statusId) {
            case '1': // Success
                return <SuccessContent />;
            case '3': // Failed
                return <FailedContent />;
            case '4': // Canceled by user (if Toyyibpay supports this redirect)
                return <CanceledContent />;
            default: // Default to success for safety, e.g. if params are missing
                return <SuccessContent />;
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
           {renderContent()}
        </div>
    );
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { CartContext } from '@/context/cart-context';

function StatusContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useContext(CartContext);

  const statusId = searchParams.get('status_id');
  const billCode = searchParams.get('billcode');
  const orderId = searchParams.get('order_id');

  const isSuccess = statusId === '1';
  const isPending = statusId === '2';
  const isFailed = statusId === '3';

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  const getStatusContent = () => {
    if (isSuccess) {
      return {
        icon: <CheckCircle className="mx-auto h-16 w-16 text-green-500" />,
        title: 'Payment Successful!',
        message: 'Thank you for your purchase. We have received your payment and your digital goods are on their way.',
        button: (
          <Button asChild size="lg" className="mt-8 rounded-full font-bold">
            <Link href="/products">Continue Shopping <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        )
      };
    } else if (isPending) {
      return {
        icon: <Clock className="mx-auto h-16 w-16 text-yellow-500" />,
        title: 'Payment is Pending',
        message: 'Your payment is still being processed. Please check back later. We will notify you once the payment is confirmed.',
        button: (
           <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full font-bold">
            <Link href="/">Back to Home</Link>
          </Button>
        )
      };
    } else if (isFailed) {
      return {
        icon: <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />,
        title: 'Payment Failed',
        message: 'Unfortunately, your payment could not be processed. Please try again.',
        button: (
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full font-bold">
            <Link href="/checkout">Try Again</Link>
          </Button>
        )
      };
    } else {
      return {
        icon: <Loader className="mx-auto h-16 w-16 animate-spin text-primary" />,
        title: 'Verifying Payment...',
        message: 'We are currently verifying your payment status. Please wait a moment.',
        button: null
      };
    }
  };

  const { icon, title, message, button } = getStatusContent();

  return (
    <div className="bg-background">
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg w-full text-center bg-card p-10 rounded-2xl shadow-xl">
          {icon}
          <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground">{message}</p>
          {billCode && <p className="mt-4 text-sm text-muted-foreground">Reference: {billCode}</p>}
          {button}
        </div>
      </div>
    </div>
  );
}

export default function ToyyibpayStatusPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader className="h-16 w-16 animate-spin" /></div>}>
            <StatusContent />
        </Suspense>
    )
}

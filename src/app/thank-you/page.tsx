
'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    // Clear the cart only once when the component mounts
    // and a PayPal token is present in the URL, indicating a successful payment.
    if (token) {
      clearCart();
    }
  }, [token, clearCart]);

  return (
    <AnimateIn>
      <div className="container mx-auto px-4 py-24 sm:py-32 text-center">
        {token ? (
          <>
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
            <h1 className="mt-8 font-headline text-4xl md:text-5xl font-bold text-foreground">
              Thank You for Your Purchase!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Your order has been successfully processed. A confirmation email with your download links has been sent to your PayPal email address. Please check your inbox (and spam folder, just in case).
            </p>
          </>
        ) : (
          <>
             <h1 className="mt-8 font-headline text-4xl md:text-5xl font-bold text-foreground">
              Thank You!
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              If you have completed a purchase, your items are on their way.
            </p>
          </>
        )}
        <div className="mt-12">
          <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
            <Link href="/products">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </AnimateIn>
  );
}

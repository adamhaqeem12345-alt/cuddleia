'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { useCart } from '@/context/cart-context';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const VisaLogo = () => (
  <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-auto">
    <path d="M24.708 6.528L21.36 23.5H16.812L20.16 6.528H24.708Z" fill="#1A1F71"/>
    <path d="M41.892 6.528L38.46 17.58L37.476 11.952C37.068 9.864 36.036 8.532 34.236 8.28L31.392 7.884L33.3 23.5H38.052L44.88 6.528H41.892Z" fill="#1A1F71"/>
    <path d="M15.42 6.528L10.368 23.5H5.856L3.132 9.684C2.868 8.424 2.196 7.476 1.044 7.08L0 6.78L5.22 6.528H15.42Z" fill="#1A1F71"/>
    <path d="M47.9658 9.948C47.6658 8.688 46.4658 7.776 45.1098 7.68L42.0138 7.428L42.5058 9.948L44.5938 10.236C45.2298 10.32 45.6138 10.8 45.7458 11.412L47.9658 9.948Z" fill="#F5A623"/>
  </svg>
);

const MastercardLogo = () => (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
        <circle cx="12" cy="12" r="12" fill="#EA001B"/>
        <circle cx="28" cy="12" r="12" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

const AmexLogo = () => (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto">
        <rect width="40" height="24" rx="3" fill="#0077C8"/>
        <path d="M12.8 6H15.2L16.8 12.8L18.4 6H20.8L18 18H15.6L12.8 6Z" fill="white"/>
        <path d="M22 6H28V8H24.8V10H27.2V12H24.8V16H28V18H22V6Z" fill="white"/>
    </svg>
);


function CheckoutPageContent() {
    const { getPrice, cart, isCartReady } = useCart();
    
    if (!isCartReady) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                 <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                 <p className="mt-4 text-lg text-muted-foreground">Loading Your Order...</p>
            </div>
        )
    }

    if (cart.length === 0) {
        return (
             <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold">Your cart is empty.</h1>
                <p className="text-muted-foreground mt-4">
                    <Link href="/products" className="text-primary hover:underline flex items-center justify-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Add some products to your cart
                    </Link>
                </p>
            </div>
        )
    }
    
    const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const subtotalPrice = getPrice(subtotal);

    return (
        <AnimateIn>
            <div className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
                <div className="bg-card p-8 rounded-2xl border shadow-lg">
                    <h1 className="text-2xl font-headline font-semibold text-foreground mb-6 text-center">
                        Order summary
                    </h1>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Subtotal (USD)</p>
                            <p className="font-medium text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Approx. MYR</p>
                            <p>{subtotalPrice.myr.formatted}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4 font-bold text-lg">
                            <p className="text-foreground">Final Order Total</p>
                            <p className="text-foreground">{subtotalPrice.usd.formatted}</p>
                        </div>
                    </div>
                    
                    <div className="my-8 border-t"></div>

                    <div className="flex justify-center items-center space-x-3 mb-6">
                        <Image src="https://www.paypalobjects.com/webstatic/mktg/logo-center/PP_Acceptance_Marks_for_LogoCenter_266x142.png" alt="PayPal" width={100} height={60} className="h-8 w-auto"/>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div className="flex items-center space-x-3">
                            <VisaLogo />
                            <MastercardLogo />
                            <AmexLogo />
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mb-6 max-w-sm mx-auto">
                        You'll be redirected to a secure gateway to complete your payment using your PayPal account or any major credit/debit card.
                    </p>
                    
                    <div className="mt-6">
                        <Button className="w-full rounded-full font-bold" size="lg" disabled>
                            <Lock className="mr-2 h-4 w-4" />
                            Proceed to Secure Payment
                        </Button>
                    </div>
                </div>
            </div>
        </AnimateIn>
    );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Loading Checkout...</p>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    )
}

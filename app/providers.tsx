'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CartProvider } from '@/context/cart-context';
import { ReactNode } from 'react';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function Providers({ children }: { children: ReactNode }) {
    
    if (!paypalClientId) {
        return (
            <div className="w-full h-screen bg-background flex items-center justify-center">
                <div className="max-w-md text-center p-8">
                     <h1 className="font-headline text-2xl text-destructive font-bold mb-4">PayPal Client ID is Missing</h1>
                     <p className="text-muted-foreground">
                        The application cannot connect to PayPal because the <code className="font-mono text-sm bg-muted p-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> is not set in your environment variables. Please add it to your <code className="font-mono text-sm bg-muted p-1 rounded">.env</code> file to proceed.
                     </p>
                </div>
            </div>
        )
    }

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}

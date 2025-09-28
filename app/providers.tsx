
'use client';

import { CartProvider } from '@/context/cart-context';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export function Providers({ children }: { children: React.ReactNode }) {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!paypalClientId) {
        // You can render a loading state or a specific error message
        // if the client ID isn't available yet.
        return (
            <div className="flex h-screen items-center justify-center">
                <div>Loading payment provider...</div>
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD', intent: 'capture' }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}

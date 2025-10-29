
'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children }: { children: React.ReactNode }) {
    // Use the environment variable for the PayPal Client ID.
    // For a live environment, we ensure that the Client ID must be present.
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!paypalClientId) {
        // In a production/live environment, we should not proceed without a client ID.
        // This will show a clear error if the environment variable is missing.
        console.error("CRITICAL: PayPal Client ID is not set in environment variables. PayPal will not function.");
        // You can return a user-friendly error component here if you wish.
        return <div className="min-h-screen flex items-center justify-center">Payment system is not configured.</div>;
    }
    
    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}

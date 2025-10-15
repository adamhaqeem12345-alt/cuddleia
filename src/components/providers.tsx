'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function Providers({ children }: { children: React.ReactNode }) {
    if (!PAYPAL_CLIENT_ID) {
        return (
            <CartProvider>
                <div className="bg-yellow-100 text-yellow-800 p-4 text-center">
                    PayPal Client ID is not configured. PayPal payments will be unavailable.
                </div>
                {children}
            </CartProvider>
        )
    }
    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}

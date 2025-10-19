'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children }: { children: React.ReactNode }) {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}

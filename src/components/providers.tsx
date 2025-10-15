'use client';

import { CartProvider } from "@/context/cart-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// This is a public test client ID provided by PayPal.
// Replace this with your own client ID when you are ready to go live.
const PAYPAL_TEST_CLIENT_ID = "AfJ_A-1PT1WQKDFE2Gz2_fAh93uP42uPUj22yr3t93k2aAFLmUQ9pgU09fLwJ1vHHYA3UvuiBe_9IeKF";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_TEST_CLIENT_ID }}>
            <CartProvider>
                {children}
            </CartProvider>
        </PayPalScriptProvider>
    );
}

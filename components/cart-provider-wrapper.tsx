'use client';

import { CartProvider, useCart } from '@/context/cart-context';
import { ReactNode } from 'react';

function CartContent({ children }: { children: ReactNode }) {
    const { isCartReady } = useCart();

    if (!isCartReady) {
        // You can render a loading spinner here if you want
        return null;
    }

    return <>{children}</>;
}

export function CartProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <CartProvider>
            <CartContent>{children}</CartContent>
        </CartProvider>
    );
}

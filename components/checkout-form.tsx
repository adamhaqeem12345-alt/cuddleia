'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckoutForm() {
    const { cart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            });

            const order = await response.json();

            if (!response.ok) {
                throw new Error(order.error || 'Failed to create PayPal order.');
            }

            const approvalLink = order.links.find((link: { rel: string; }) => link.rel === 'approve');
            if (approvalLink) {
                // Redirect user to PayPal for payment approval
                window.location.href = approvalLink.href;
            } else {
                throw new Error('No approval link found in PayPal order.');
            }
        } catch (err: any) {
            console.error("Checkout Error:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {error && <div className="text-center text-destructive font-medium p-4">{error}</div>}
            
            <Button
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
                className="w-full h-12 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-lg"
            >
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    'Pay with PayPal'
                )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">You will be redirected to PayPal to complete your purchase.</p>
        </div>
    );
}

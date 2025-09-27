'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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

            // Find the approval link to redirect the user
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
            {error && <div className="text-center text-destructive font-medium p-4 mb-4 bg-destructive/10 rounded-lg">{error}</div>}
            
            <Button
                onClick={handleCheckout}
                disabled={isLoading || cart.length === 0}
                className="w-full h-14 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-lg rounded-lg shadow-md transition-transform hover:scale-[1.02]"
            >
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    'Proceed to Secure Payment'
                )}
            </Button>
            <div className="text-center mt-4">
                <p className="text-sm font-medium text-muted-foreground">Pay with PayPal or Card</p>
                <div className="flex justify-center items-center gap-3 mt-2">
                    <Image src="https://i.postimg.cc/SNpv3vj2/paypal-logo.png" alt="PayPal" width={70} height={20} />
                    <div className="border-l h-5 bg-gray-300"></div>
                     <Image src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c258d5/svg/color/visa.svg" alt="Visa" width={35} height={20} />
                     <Image src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c258d5/svg/color/mc.svg" alt="Mastercard" width={35} height={20} />
                     <Image src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c258d5/svg/color/amex.svg" alt="American Express" width={35} height={20} />
                </div>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3" /> You will be redirected to PayPal's secure server to complete your purchase.
            </p>
        </div>
    );
}

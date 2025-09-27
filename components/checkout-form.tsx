'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import Image from 'next/image';

export function CheckoutForm() {
    const { cart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Standard, robust request body structure.
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create PayPal order.');
            }
            
            const approvalLink = data.links.find((link: { rel: string; }) => link.rel === 'approve');
            if (approvalLink) {
                // Redirect user to PayPal for payment approval.
                router.push(approvalLink.href);
            } else {
                 throw new Error('No PayPal approval link found. Please try again.');
            }

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full">
            <div className="text-center bg-gray-50/50 rounded-xl p-6">
                
                <Button
                    onClick={handleCheckout}
                    disabled={isLoading || cart.length === 0}
                    className="w-full font-bold shadow-lg text-lg py-6 mb-4"
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Lock className="mr-2 h-5 w-5" />
                    )}
                    Proceed to Secure Payment
                </Button>
                
                <p className="text-sm text-muted-foreground mb-6">
                    You'll be redirected to PayPal's secure gateway to complete your payment using your PayPal account or any major credit/debit card.
                </p>

                 <div className="flex justify-center items-center space-x-4">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={100} height={26} className="h-7 w-auto" />
                    <span className="text-muted-foreground/50 text-2xl font-light">|</span>
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" width={50} height={16} className="h-4 w-auto" />
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" width={42} height={26} className="h-7 w-auto" />
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" width={42} height={26} className="h-7 w-auto" />
                </div>
            </div>
            
            {error && <div className="text-center text-destructive font-medium p-4 mt-4 bg-destructive/10 rounded-lg">{error}</div>}
        </div>
    );
}

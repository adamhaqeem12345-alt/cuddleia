'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
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
            const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create PayPal order.');
            }
            
            // Find the approval link and redirect the user
            const approvalLink = data.links.find((link: { rel: string; }) => link.rel === 'approve');
            if (approvalLink) {
                router.push(approvalLink.href);
            } else {
                 throw new Error('No approval link found in PayPal response.');
            }

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full">
            <div className="text-center">
                 <div className="flex justify-center items-center space-x-4 mb-6">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={100} height={26} />
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Visa_Inc._logo.svg" alt="Visa" width={50} height={26} />
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" width={42} height={26} />
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                    You will be redirected to PayPal's secure checkout page to complete your payment. You can use your PayPal account or pay with a debit/credit card.
                </p>
                
                <Button
                    onClick={handleCheckout}
                    disabled={isLoading || cart.length === 0}
                    className="w-full font-bold shadow-lg"
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <ShieldCheck className="mr-2 h-5 w-5" />
                    )}
                    Proceed to Secure Payment
                </Button>
            </div>
            
            {error && <div className="text-center text-destructive font-medium p-4 mt-4 bg-destructive/10 rounded-lg">{error}</div>}
        </div>
    );
}


'use client';

import { useState, useContext } from 'react';
import { CartContext } from '@/context/cart-context';
import { Button } from './ui/button';
import { Loader } from 'lucide-react';

export const ToyyibpayButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { cartItems } = useContext(CartContext);
    
    // Simple form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handlePayment = async () => {
        setIsLoading(true);
        setError(null);

        if (!name || !email || !phone) {
            setError('Please fill in all your details.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/toyyibpay/create-bill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart: cartItems.map(item => ({
                        id: item.id,
                        quantity: item.quantity,
                    })),
                    user: { name, email, phone }
                }),
            });

            const data = await res.json();

            if (res.ok && data.paymentUrl) {
                // Redirect to ToyyibPay payment URL
                window.location.href = data.paymentUrl;
            } else {
                throw new Error(data.error || 'Failed to create ToyyibPay bill.');
            }
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-border bg-background p-2" required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-border bg-background p-2" required />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">Phone Number</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-border bg-background p-2" placeholder="e.g. 60123456789" required />
            </div>
            
            <Button
                onClick={handlePayment}
                disabled={isLoading || cartItems.length === 0}
                className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
            >
                {isLoading ? (
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2"><title>FPX</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.27 15.684h-1.895v-3.79h1.895c.575 0 .947-.37.947-.948V9.75c0-.578-.372-.947-.947-.947h-1.895V7.21c0-.578-.372-.948-.947-.948H9.473c-.574 0-.947.37-.947.948v1.592H6.93c-.575 0-.947.37-.947.948v1.196c0 .578.372.948.947.948h1.596v3.79H6.93c-.575 0-.947.37-.947.947v1.14c0 .577.372.947.947.947h9.473c.574 0 .947-.37.947-.947v-1.14c0-.577-.372-.947-.947-.947zm-5.69 0H9.473v-3.79h2.107v3.79z" fill="currentColor"/></svg>
                )}
                {isLoading ? 'Processing...' : 'Pay with ToyyibPay / FPX'}
            </Button>

            {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
        </div>
    );
};

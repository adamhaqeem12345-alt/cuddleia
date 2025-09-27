
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { CartItem } from '@/lib/types';

export function CheckoutForm({ cart }: { cart: CartItem[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart }),
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || 'Failed to create PayPal order.');
      }

      if (order.id && order.approveUrl) {
        window.location.href = order.approveUrl;
      } else {
        throw new Error('Received invalid order data from server.');
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-destructive/10 text-destructive-foreground border-l-4 border-destructive rounded-r-lg p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        </div>
      )}
      <Button 
        onClick={handlePayment} 
        disabled={isLoading} 
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold" 
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay with PayPal'
        )}
      </Button>
      <p className="text-xs text-center mt-2 text-muted-foreground">You will be redirected to PayPal to complete your purchase securely.</p>
    </div>
  );
}

'use client';

// Secrets are in .env.local — do not hardcode here.
import { PayPalScriptProvider, PayPalButtons, type OnApproveData, type CreateOrderData } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';

const paypalClientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

interface PaypalCheckoutProps {
    isFormValid: boolean;
    isProcessing: boolean;
    setIsProcessing: (isProcessing: boolean) => void;
    setError: (error: string | null) => void;
    finalTotal: number;
    customerName: string;
    customerEmail: string;
    items: Product[];
    clearCart: () => void;
}

export function PaypalCheckout({ 
    isFormValid, 
    isProcessing, 
    setIsProcessing, 
    setError,
    finalTotal,
    customerName,
    customerEmail,
    items,
    clearCart,
}: PaypalCheckoutProps) {
    const router = useRouter();

    if (!paypalClientID) {
        console.error("PayPal Client ID is not configured. The PayPal button will not be rendered.");
        return (
            <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">International payment is currently unavailable. We are working to restore it.</p>
            </div>
        );
    }
    
    // This function is called when the user clicks the PayPal button.
    const createOrder = async (data: CreateOrderData) => {
        console.log("PayPal: Creating order...");
        setIsProcessing(true);
        setError(null);
        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    total: finalTotal.toFixed(2),
                }),
            });
            const order = await response.json();
            if (response.ok && order.id) {
                console.log(`PayPal: Order created successfully with ID: ${order.id}`);
                return order.id;
            } else {
                console.error("PayPal: Failed to create order.", order);
                throw new Error(order.error || 'Failed to create PayPal order.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            console.error("PayPal: Error in createOrder.", err);
            setError(message);
            setIsProcessing(false);
            return Promise.reject(err);
        }
    };
    
    // This function is called after the user approves the payment on PayPal.
    const onApprove = async (data: OnApproveData) => {
        console.log(`PayPal: Payment approved by user. OrderID: ${data.orderID}`);
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderID: data.orderID,
                    customerName,
                    customerEmail,
                    items,
                }),
            });
    
            const details = await response.json();
    
            if (response.ok && details.success) {
                console.log(`PayPal: Order ${data.orderID} captured successfully.`);
                clearCart();
                router.push('/checkout/success');
            } else {
                 console.error("PayPal: Failed to capture payment.", details);
                throw new Error(details.error || 'Failed to capture payment.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            console.error("PayPal: Error in onApprove.", err);
            setError(message);
            setIsProcessing(false); // Set processing to false on error to allow retry
        }
    };

    // This function handles errors from the PayPal button.
    const onError = (err: any) => {
        console.error("PayPal: Button error.", err);
        setError("An error occurred with the PayPal transaction. Please try again or use a different payment method.");
        setIsProcessing(false);
    };

    return (
        <PayPalScriptProvider options={{ 'client-id': paypalClientID, currency: 'USD', intent: 'capture' }}>
            <PayPalButtons
                style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                disabled={!isFormValid || finalTotal <= 0 || isProcessing}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                forceReRender={[finalTotal, customerName, customerEmail]} // Re-render buttons if these details change
            />
        </PayPalScriptProvider>
    );
}

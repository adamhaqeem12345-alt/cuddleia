
'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const paypalClientId = "AcP9f98y69e5wW3gR4v1qoIoZejFUNxj4CF9ceA-CBbXq152xI1qnMugLF_rKs3yXN-fuyFIKuWpqeIW";
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items, router]);

  const createOrder = (data: CreateOrderData, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: subtotal.toFixed(2),
            currency_code: 'USD',
          },
        },
      ],
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    setIsProcessing(false);
    return actions.order.capture().then(function (details: any) {
      alert('Transaction completed by ' + details.payer.name.given_name);
      // Here you would typically handle the post-payment logic,
      // like sending an email with download links via Zoho.
      clearCart();
      router.push('/'); // Redirect to home page after successful payment
    });
  };

  const onError = (err: any) => {
    setIsProcessing(false);
    console.error('PayPal Checkout Error', err);
    alert('An error occurred during the transaction. Please try again.');
  };

  const handleCardClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
    }, 3000);
  }

  if (items.length === 0) {
    return null; 
  }

  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                Checkout
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                Complete your purchase.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <AnimateIn>
                <div className="bg-card p-8 rounded-2xl shadow-lg">
                    <h2 className="font-headline text-2xl font-bold border-b pb-4 mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Quantity: 1</p>
                                </div>
                                <ProductPrice price={item.price} />
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <ProductPrice price={subtotal} />
                        </div>
                    </div>
                </div>
            </AnimateIn>
            <AnimateIn delay={150}>
                 <div className="bg-card p-8 rounded-2xl shadow-lg">
                    <h2 className="font-headline text-2xl font-bold mb-6">Payment Method</h2>
                    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}>
                        <PayPalButtons 
                            style={{ layout: "vertical" }}
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                            onClick={(data, actions) => {
                                // The 'card' funding source is for the Debit/Credit card button
                                if(data.fundingSource === 'card') {
                                    handleCardClick();
                                }
                                return actions.resolve();
                            }}
                            onCancel={() => setIsProcessing(false)}
                        />
                    </PayPalScriptProvider>
                    {isProcessing && (
                        <div className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
                            <p>Processing payment...</p>
                        </div>
                    )}
                 </div>
            </AnimateIn>
        </div>
        <AnimateIn delay={300}>
            <div className="mt-12 text-center">
                <Button asChild variant="ghost">
                    <Link href="/cart">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                    </Link>
                </Button>
            </div>
        </AnimateIn>
      </div>
    </div>
  );
}

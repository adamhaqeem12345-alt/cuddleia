'use client';

import { useContext } from 'react';
import { CartContext } from '@/context/cart-context';
import { PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);

  const createOrder = (data: CreateOrderData, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: cartTotal.toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    return actions.order.capture().then((details: any) => {
      alert('Transaction completed by ' + details.payer.name.given_name);
      // Here you would typically handle the digital product delivery,
      // e.g., by sending an email with download links.
      clearCart();
    });
  };

  const onError = (err: any) => {
    console.error("PayPal Checkout onError", err);
    alert('An error occurred during the checkout process. Please try again.');
  };

  return (
    <div className="bg-background">
       <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="relative z-10 text-center">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">Checkout</h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">Finalize your order.</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="font-headline text-3xl text-foreground font-bold mt-6">Your cart is empty</h2>
            <p className="mt-4 text-lg text-muted-foreground">You have no items to check out.</p>
            <Link href="/products" className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full px-8 mt-8 font-bold">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div>
              <h2 className="font-headline text-3xl font-bold text-foreground mb-6 border-b pb-4">Order Summary</h2>
              <ul className="divide-y divide-border">
                {cartItems.map((item) => (
                  <li key={item.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex justify-between text-xl font-bold text-foreground">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className='bg-card p-8 rounded-2xl shadow-lg'>
              <h2 className="font-headline text-3xl font-bold text-foreground mb-6">Payment</h2>
              <p className='text-muted-foreground mb-6'>Complete your purchase using PayPal.</p>
              <PayPalButtons
                style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

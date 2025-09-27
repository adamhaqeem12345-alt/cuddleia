
'use client';

import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { X, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { AnimateIn } from '@/components/animate-in';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { OnApproveData, CreateOrderData } from '@paypal/paypal-js';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getPrice, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCreateOrder = async (data: CreateOrderData) => {
    // No need to set isProcessing here, PayPal handles the UI state.
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
      if (order.id) {
          return order.id;
      } else {
          throw new Error("Received an invalid order ID from the server.");
      }
    } catch (err: any) {
      console.error("Create Order Error:", err);
      setError(err.message);
      // Re-throw the error to be caught by PayPal's onError handler
      throw err;
    }
  };

  const handleOnApprove = async (data: OnApproveData) => {
    setIsProcessing(true); // Show processing state on our page
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const capturedData = await response.json();
      if (!response.ok) {
        throw new Error(capturedData.error || 'Failed to capture payment.');
      }
      
      // On successful capture, the webhook will handle the email.
      // Redirect to a success page.
      clearCart();
      window.location.href = `/checkout/success?orderId=${capturedData.id}`;

    } catch (err: any) {
      console.error("Approve Order Error:", err);
      setError(err.message);
      setIsProcessing(false);
    }
  };
  
  const handleOnError = (err: any) => {
      console.error("PayPal Error:", err);
      setError('An error occurred with the PayPal transaction. Please try again or contact support.');
      setIsProcessing(false);
  }

  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!PAYPAL_CLIENT_ID) {
    return (
        <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="text-2xl font-bold text-destructive">PayPal Client ID is not configured.</h1>
            <p className="text-muted-foreground mt-4">Please set the NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable.</p>
        </div>
    );
  }

  return (
    <AnimateIn>
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
          Your Shopping Cart
        </h1>
        {cart.length === 0 ? (
          <div className="text-center mt-16">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground/50" />
            <p className="mt-6 text-lg text-muted-foreground">Your cart is currently empty.</p>
            <Button asChild className="mt-8 rounded-full font-bold shadow-lg transition-transform hover:scale-105" size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section className="lg:col-span-7">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden md:table-cell">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={64}
                          height={48}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{getPrice(item.price).formatted}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                           <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                           <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center" />
                           <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{getPrice(item.price * item.quantity).formatted}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <X className="h-5 w-5" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-left font-bold text-lg">Subtotal</TableCell>
                        <TableCell colSpan={2} className="text-right font-bold text-lg">{getPrice(subtotal).formatted}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
               <div className="mt-8">
                <Button asChild variant="ghost">
                    <Link href="/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
              </div>
            </section>

            <section className="lg:col-span-5 mt-16 rounded-lg bg-gray-50/50 px-4 py-6 sm:p-6 lg:mt-0 lg:p-8 border shadow-sm">
              <h2 className="text-lg font-medium text-foreground">Order summary</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-sm font-medium text-foreground">{getPrice(subtotal).formatted}</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <p className="text-base font-medium text-foreground">Order total</p>
                  <p className="text-base font-medium text-foreground">{getPrice(subtotal).formatted}</p>
                </div>
              </div>
              <div className="mt-6">
                {isProcessing && <div className="text-center text-muted-foreground">Finalizing your order...</div>}
                {error && <div className="text-center text-destructive font-medium mb-4">{error}</div>}
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
                    <PayPalButtons 
                        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                        createOrder={handleCreateOrder}
                        onApprove={handleOnApprove}
                        onError={handleOnError}
                        disabled={isProcessing || cart.length === 0}
                        className={isProcessing ? 'opacity-50 pointer-events-none' : ''}
                    />
                </PayPalScriptProvider>
              </div>
            </section>
          </div>
        )}
      </div>
    </AnimateIn>
  );
}

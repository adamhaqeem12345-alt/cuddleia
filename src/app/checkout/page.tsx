'use client';

import { useState } from 'react';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, getPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const subtotal = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          total: getPrice(subtotal).raw,
          orderId: `cuddleia-${Math.random().toString(36).substring(2, 9)}`,
          products: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send confirmation email.');
      }

      // The email has been sent. Now, redirect to PayPal.
      // In a real-world scenario, you'd generate a dynamic PayPal payment link.
      // For this example, we redirect to the main PayPal page.
      clearCart();
      window.location.href = 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=YOUR_PAYPAL_EMAIL&currency_code=USD&amount=' + getPrice(subtotal).raw.toFixed(2);

    } catch (error) {
      console.error('Checkout error:', error);
      // Optionally, show an error message to the user
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-[80vh]">
      <AnimateIn>
        <section className="bg-accent/30 py-16 text-center">
          <h1 className="font-headline text-5xl font-bold text-foreground">
            Checkout
          </h1>
        </section>
      </AnimateIn>

      <AnimateIn className="py-16">
        <div className="container mx-auto px-4">
          {cart.length === 0 ? (
            <div className="text-center">
              <p className="text-xl font-body text-foreground/80 mb-8">
                Your cart is empty. There is nothing to check out.
              </p>
              <Button asChild size="lg" className="rounded-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6 md:order-2">
                <h2 className="font-headline text-3xl font-bold border-b pb-4">
                  Order Summary
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-headline text-lg">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-body font-semibold">
                        {getPrice(item.price * item.quantity).formatted}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between font-body text-lg">
                    <span>Subtotal</span>
                    <span>{getPrice(subtotal).formatted}</span>
                  </div>
                  <div className="flex justify-between font-body text-xl font-bold">
                    <span>Total</span>
                    <span>{getPrice(subtotal).formatted}</span>
                  </div>
                </div>
              </div>

              <div className="md:order-1">
                <form
                  onSubmit={handleCheckout}
                  className="bg-card p-8 rounded-2xl shadow-lg space-y-8"
                >
                  <div>
                    <h2 className="font-headline text-3xl font-bold border-b pb-4">
                      Your Details
                    </h2>
                     <p className="text-muted-foreground mt-4 font-body">
                        Your download links will be sent to the email address you provide below.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-lg font-headline">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-headline">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full text-lg py-7"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Processing...'
                      : `Proceed to PayPal - ${getPrice(subtotal).formatted}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center pt-4">
                    You will be redirected to PayPal to complete your purchase securely.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </AnimateIn>
    </div>
  );
}

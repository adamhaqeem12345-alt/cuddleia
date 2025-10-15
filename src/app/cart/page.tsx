'use client';

import { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CartContext } from '@/context/cart-context';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useContext(CartContext);

  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="relative z-10 text-center">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">Your Cart</h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">Review your items before proceeding to checkout.</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-headline text-3xl text-foreground font-bold">Your cart is empty</h2>
            <p className="mt-4 text-lg text-muted-foreground">Looks like you haven't added any products yet.</p>
            <Button asChild size="lg" className="mt-8 rounded-full font-bold">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ul className="divide-y divide-border">
              {cartItems.map(item => (
                <li key={item.id} className="flex py-6">
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-foreground">
                        <h3 className='font-headline text-xl'>
                          <Link href={`/products/${item.id}`}>{item.name}</Link>
                        </h3>
                        <p className="ml-4 font-headline text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border border-muted rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex">
                        <Button variant="ghost" type="button" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-8 mt-8">
              <div className="flex justify-between text-lg font-headline font-bold text-foreground">
                <p>Subtotal</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <div className="mt-8">
                <Button asChild size="lg" className="w-full rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                  <Link href="/checkout">
                    Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                <p>
                  or{' '}
                  <Link href="/products" className="font-medium text-primary hover:text-primary/80">
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

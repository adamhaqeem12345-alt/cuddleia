'use client';

import { useCart } from '@/lib/cart';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';

export default function CartPage() {
  const { items, removeFromCart, subtotal } = useCart();

  const hasPaidItems = items.some(item => item.price > 0);

  return (
    <div className="bg-background">
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
                Your Cart
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                Review your items.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <div className="md:col-span-2">
                <AnimateIn>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <AnimateIn key={`${item.id}-${index}`} delay={index * 100}>
                                <div className="flex items-start justify-between gap-6 bg-card p-6 rounded-2xl shadow-sm">
                                    <div className="flex items-start gap-6">
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <Link href={`/products/${item.id}`} className="hover:text-primary transition-colors">
                                                <h3 className="font-headline text-xl font-bold">{item.name}</h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <ProductPrice price={item.price} />
                                        <Button variant="ghost" size="icon" className="mt-2 rounded-full h-8 w-8" onClick={() => removeFromCart(item.id)}>
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                    </div>
                                </div>
                            </AnimateIn>
                        ))}
                    </div>
                </AnimateIn>
            </div>
            <div className="md:col-span-1">
                <AnimateIn delay={items.length * 100}>
                    <div className="sticky top-28 bg-card p-8 rounded-2xl shadow-lg">
                        <h2 className="font-headline text-2xl border-b pb-4 font-bold">Order Summary</h2>
                        <div className="flex justify-between items-center font-bold text-lg my-4">
                            <span>Subtotal</span>
                             <ProductPrice price={subtotal} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">This is a summary of the items in your cart.</p>
                        
                        <p className="text-center text-muted-foreground">All items are free and can be downloaded directly from their product page.</p>
                       
                        <div className="mt-6">
                             <Button asChild variant="ghost" className="w-full">
                                <Link href="/products">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Continue Shopping
                                </Link>
                            </Button>
                        </div>
                    </div>
                </AnimateIn>
            </div>
          </div>
        ) : (
          <AnimateIn>
            <div className="text-center py-16">
              <h2 className="font-headline text-3xl text-foreground font-bold">Your cart is empty</h2>
              <p className="mt-4 text-lg text-muted-foreground">Looks like you haven't added any products yet.</p>
              <Button asChild size="lg" className="mt-8 font-bold">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </AnimateIn>
        )}
      </div>
    </div>
  );
}

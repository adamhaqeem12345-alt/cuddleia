'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CartPage = () => {
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
        <div className="text-center py-16">
          <h2 className="font-headline text-3xl text-foreground font-bold">Your cart is empty</h2>
          <p className="mt-4 text-lg text-muted-foreground">Looks like you haven't added any products yet.</p>
          <Button asChild size="lg" className="mt-8 rounded-full font-bold">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

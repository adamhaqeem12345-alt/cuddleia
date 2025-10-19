'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Flower2, Menu, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useEffect } from 'react';

export function SiteHeader() {
  const { cart } = useCart();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="w-full sticky top-0 z-40 bg-accent">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <div className="flex items-center gap-2">
            <Flower2 className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl tracking-tight text-foreground font-bold">cuddleia</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <Link href="/" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary font-bold">Home</Link>
            <Link href="/products" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary font-bold">Products</Link>
            <Link href="/about" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary font-bold">About</Link>
            <Link href="/contact" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary font-bold">Contact</Link>
          </nav>
          
          <Link href="/cart">
              <Button variant="outline" size="icon" className="relative h-14 w-14 rounded-full">
                <ShoppingCart className="h-7 w-7 text-foreground" />
                {hasMounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Open Cart</span>
              </Button>
          </Link>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
                  <Menu className="h-7 w-7 text-foreground" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col items-center gap-6 mt-12">
                   <Link href="/" className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary font-bold">Home</Link>
                  <Link href="/products" className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary font-bold">Products</Link>
                  <Link href="/about" className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary font-bold">About</Link>
                  <Link href="/contact" className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary font-bold">Contact</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

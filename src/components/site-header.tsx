'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Flower2, Menu, ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '@/context/cart-context';

export function SiteHeader() {
  const { cartCount } = useContext(CartContext);

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
          </nav>
          <Button asChild variant="ghost" size="icon" className="h-14 w-14 rounded-full relative">
            <Link href="/cart">
              <ShoppingCart className="h-7 w-7 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
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
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

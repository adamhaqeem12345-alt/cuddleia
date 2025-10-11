'use client';

import Link from 'next/link';
import { Flower2, Menu, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
  ];

  const closeSheet = () => setIsOpen(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-accent">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <div className="flex items-center gap-2">
            <Flower2 className="h-8 w-8 text-primary" />
            <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
              cuddleia
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button asChild variant="ghost" size="icon" className="h-14 w-14 rounded-full relative">
            <Link href="/cart">
              <ShoppingCart className="h-7 w-7 text-foreground" />
              {isClient && items.length > 0 && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {items.length}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
                  <Menu className="h-7 w-7 text-foreground" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="max-w-[16rem]">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Main site navigation links.</SheetDescription>
                  <Link href="/" onClick={closeSheet} className="mb-8">
                    <div className="flex items-center gap-2">
                      <Flower2 className="h-8 w-8 text-primary" />
                      <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
                        cuddleia
                      </span>
                    </div>
                  </Link>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeSheet}
                      className="font-headline text-xl text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

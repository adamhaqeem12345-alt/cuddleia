'use client';

import Link from 'next/link';
import { Flower2, ShoppingBag, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function SiteHeader() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="w-full border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
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
          
          <Button asChild variant="outline" size="icon" className="relative h-14 w-14 rounded-full">
            <Link href="/cart">
                <ShoppingBag className="h-7 w-7 text-foreground" />
                <span className="sr-only">Open Shopping Cart</span>
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
              <SheetContent side="left" className="w-full sm:w-auto sm:max-w-xs">
                <div className="flex flex-col h-full">
                  <div className="border-b pb-4">
                     <Link href="/" className="transition-transform hover:scale-105">
                      <div className="flex items-center gap-2">
                        <Flower2 className="h-8 w-8 text-primary" />
                        <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
                          cuddleia
                        </span>
                      </div>
                    </Link>
                  </div>
                  <nav className="flex flex-col gap-6 py-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="font-headline text-xl text-foreground/80 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

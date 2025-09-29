'use client';

import Link from 'next/link';
import { Flower2, Menu, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function SiteHeader() {
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
            <Link
              href="/"
              className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
          <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-14 w-14">
                        <Menu className="h-7 w-7 text-foreground" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="flex flex-col gap-8 pt-6">
                         <Link href="/" className="transition-transform hover:scale-105 pl-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Flower2 className="h-8 w-8 text-primary" />
                                <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
                                cuddleia
                                </span>
                            </div>
                        </Link>
                        <nav className="flex flex-col items-start gap-6 pl-4">
                            <Link
                            href="/"
                            className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary"
                            >
                            Home
                            </Link>
                            <Link
                            href="/products"
                            className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary"
                            >
                            Products
                            </Link>
                            <Link
                            href="/about"
                            className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary"
                            >
                            About
                            </Link>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
          <Button asChild variant="outline" size="icon" className="relative h-14 w-14 rounded-full">
            <Link href="/cart">
                <ShoppingBag className="h-7 w-7 text-foreground" />
                <span className="sr-only">Open Shopping Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

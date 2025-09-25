'use client'
import Link from 'next/link';
import { Flower2, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { useState } from 'react';

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
]

const Header = () => {
    const { cart } = useCart();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">{link.label}</Link>
            ))}
          </nav>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden rounded-full h-14 w-14">
                    <Menu className="h-7 w-7 text-foreground" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                         <Flower2 className="h-8 w-8 text-primary" />
                        <span className="font-headline text-3xl font-bold tracking-tight text-foreground">
                        cuddleia
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6 mt-8">
                     {navLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary">{link.label}</Link>
                        </SheetClose>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="icon" className="relative h-14 w-14 rounded-full" asChild>
            <Link href="/cart">
                <ShoppingBag className="h-7 w-7 text-foreground" />
                <span className="sr-only">Open Shopping Cart</span>
                {cart.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {cart.length}
                    </span>
                )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;


'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cart/cart-sheet';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function Header() {
    const { cartCount, isHydrating } = useCart();
    const [isCartOpen, setCartOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ]

  return (
    <>
    <header className="w-full border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                    <Link key={item.label} href={item.href} className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">
                        {item.label}
                    </Link>
                ))}
            </nav>
            
            <div className='md:hidden'>
                <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full">
                            <Menu className="h-7 w-7 text-foreground" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px]">
                        <SheetHeader className="mb-8">
                           <VisuallyHidden>
                                <SheetTitle>Main Menu</SheetTitle>
                           </VisuallyHidden>
                           <Logo />
                        </SheetHeader>
                        <nav className="flex flex-col items-start gap-6">
                            {navItems.map((item) => (
                                <SheetClose asChild key={item.label}>
                                    <Link  href={item.href} className="font-headline text-2xl text-foreground/80 transition-colors hover:text-primary">
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
            
            <Button variant="ghost" className="relative h-14 w-14 rounded-full" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="h-7 w-7 text-foreground" />
                {isClient && cartCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {cartCount}
                    </span>
                )}
                <span className="sr-only">Open Shopping Cart</span>
            </Button>
        </div>
      </div>
    </header>
    <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}

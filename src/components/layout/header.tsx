
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cart/cart-sheet';

export function Header() {
    const { cartCount } = useCart();
    const [isCartOpen, setCartOpen] = useState(false);

    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
    ]

  return (
    <>
    <header className="w-full border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-105">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                    <Link key={item.label} href={item.href} className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">
                        {item.label}
                    </Link>
                ))}
            </nav>
            <Button variant="ghost" className="relative h-14 w-14 rounded-full" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="h-7 w-7 text-foreground" />
                {cartCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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

'use client'
import Link from 'next/link';
import { Flower2, Menu, ShoppingBag } from 'lucide-react';

const Header = () => {
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
            <Link href="/" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">Home</Link>
            <Link href="/products" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">Products</Link>
            <Link href="/about" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">About</Link>
            <Link href="/contact" className="font-headline text-lg text-foreground/80 transition-colors hover:text-primary">Contact</Link>
          </nav>
          <div className="md:hidden">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-14 w-14 rounded-full" type="button">
              <Menu className="h-7 w-7 text-foreground" />
              <span className="sr-only">Open Menu</span>
            </button>
          </div>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-14 w-14 rounded-full">
            <ShoppingBag className="h-7 w-7 text-foreground" />
            <span className="sr-only">Open Shopping Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

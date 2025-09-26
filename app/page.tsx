
'use client'
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-accent/30 py-28 md:py-40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4">
          <AnimateIn className="text-center">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Welcome to <span className="text-primary">cuddleia</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80 font-body">
              Discover cozy digital wallpapers and thoughtfully designed Islamic booklets that bring warmth and serenity to your day.
            </p>
          </AnimateIn>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <AnimateIn className="text-center">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Crafted with Love</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-foreground/80 font-body">
              At Cuddleia, we pour our hearts into creating beautiful digital products. From cozy iPad wallpapers to thoughtfully designed Islamic booklets, each creation is made to bring a touch of warmth and serenity into your life.
            </p>
          </AnimateIn>
          <AnimateIn className="mt-16 text-center">
             <Button size="lg" className="rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95" asChild>
                <Link href="#products">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore Our Creations
                </Link>
            </Button>
          </AnimateIn>
        </div>
      </section>
      
      <section id="products" className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4">
          <AnimateIn className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Featured Creations</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-foreground/70 font-body">
              A few of our favorite handcrafted digital goods.
            </p>
          </AnimateIn>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product, i) => (
              <AnimateIn key={product.id} delay={i * 150} start="opacity-0 scale-95">
                <ProductCard product={product} />
              </AnimateIn>
            ))}
          </div>
          <AnimateIn className="mt-16 text-center">
            <Button size="lg" className="rounded-full" asChild>
                <Link href="/products">
                Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}

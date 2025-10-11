
'use client';

import { products } from '@/lib/products';
import { AnimateIn } from '@/components/animate-in';
import { FeaturedProducts } from '@/components/featured-products';
import { MadeWithHeart } from '@/components/made-with-heart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductCard } from '@/components/product-card';

const BarakahBlueprintSection = () => {
    const vol1 = products.find(p => p.id === '001');
    const series = products.filter(p => p.category === 'Booklets' && p.id !== '001');

    if (!vol1) return null;

    return (
        <>
            <section className="bg-accent py-24 sm:py-32">
                <AnimateIn>
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                           <div className="relative aspect-[3/4] w-full max-w-xs mx-auto rounded-lg shadow-2xl overflow-hidden">
                                <Image
                                    src={vol1.imageUrl}
                                    alt={vol1.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                                The Barakah Blueprint
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                A 5-volume series to guide you in building a sincere, halal, and successful business from the ground up. Start your journey today with the first volume, completely free.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <AddToCartButton product={vol1} size="lg" className="font-bold">
                                    <Download className="mr-2 h-5 w-5" />
                                    Get Volume 1 Free
                                </AddToCartButton>
                                <Button asChild size="lg" variant="outline">
                                    <Link href="/products">
                                        Explore the Series
                                    </Link>
                                </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateIn>
            </section>
            
            <section className="bg-accent py-24 sm:py-32">
                <div className="container mx-auto px-4">
                     <AnimateIn>
                        <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                            The Complete 5-Volume Series
                        </h2>
                        <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
                            Each volume builds on the last, covering everything from branding and marketing to automation and scaling with Iman.
                        </p>
                    </AnimateIn>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {series.map((product, index) => (
                            <AnimateIn key={product.id} delay={index * 150}>
                                <ProductCard product={product} />
                            </AnimateIn>
                        ))}
                    </div>
                    <AnimateIn delay={series.length * 150}>
                        <div className="mt-20 text-center">
                            <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg transition-transform hover:scale-105">
                                <Link href="/products">View All Products <ArrowRight className="ml-2 h-5 w-5"/></Link>
                            </Button>
                        </div>
                    </AnimateIn>
                </div>
            </section>
        </>
    )
}


export default function HomePage() {
  return (
    <>
      <section className="h-[75vh] bg-accent flex flex-col items-center justify-center text-center px-4">
        <AnimateIn>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
            Cozy Digital Goods
          </h1>
          <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Thoughtfully designed Islamic booklets and wallpapers that bring
            warmth, beauty, and serenity to your day.
          </p>
        </AnimateIn>
      </section>

      <BarakahBlueprintSection />
      <FeaturedProducts />
      <MadeWithHeart />
    </>
  );
}

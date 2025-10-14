
'use client';

import { products } from '@/lib/products';
import { AnimateIn } from '@/components/animate-in';
import { FeaturedProducts } from '@/components/featured-products';
import { MadeWithHeart } from '@/components/made-with-heart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { FreeDownloadDialog } from '@/components/free-download-dialog';

const BarakahBlueprintSection = () => {
    const vol1 = products.find(p => p.id === '001');

    if (!vol1) return null;

    return (
        <>
            <section className="bg-accent py-24 sm:py-32">
                <AnimateIn>
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                           <div className="relative aspect-[3/4] w-full max-w-xs mx-auto rounded-lg shadow-2xl overflow-hidden group">
                                <Image
                                    src={vol1.imageUrl}
                                    alt={vol1.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">
                                The Barakah Business Blueprint
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                A 5-volume series to guide you in building a sincere, halal, and successful business from the ground up. Start your journey today with the first volume, completely free.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                    <FreeDownloadDialog product={vol1} size="lg" />
                                    <Button asChild size="lg" variant="outline">
                                        <Link href="/products">
                                            Explore Other Products
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateIn>
            </section>
        </>
    )
}


export default function HomePage() {
  return (
    <>
      <section className="h-[75vh] bg-accent flex flex-col items-center justify-center text-center px-4">
        <AnimateIn>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
            Where Creativity Meets Barakah
          </h1>
          <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Discover cozy wallpapers and Islamic booklets designed to bring warmth, beauty, and serenity to your digital life.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-bold">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </AnimateIn>
      </section>

      <BarakahBlueprintSection />
      <FeaturedProducts />
      <MadeWithHeart />
    </>
  );
}


'use client';

import { products } from '@/lib/products';
import { AnimateIn } from '@/components/animate-in';
import { FeaturedProducts } from '@/components/featured-products';
import { MadeWithHeart } from '@/components/made-with-heart';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import Image from 'next/image';
import { AddToCartButton } from '@/components/add-to-cart-button';

const EbookScrollExperience = () => {
  const ebooks = products.filter((p) => p.category === 'Booklets').slice(0, 5);
  const vol1 = ebooks[0];

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Opacity for Hero Section (Fades out)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Animation for Intro Section (Fades in, then out)
  const introOpacity = useTransform(scrollYProgress, [0.15, 0.25, 0.45, 0.55], [0, 1, 1, 0]);
  const introScale = useTransform(scrollYProgress, [0.15, 0.25], [0.95, 1]);


  // Animation for the rest of the series (Carousel)
  const seriesOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  const seriesScale = useTransform(scrollYProgress, [0.5, 0.6], [0.9, 1]);

  return (
    <>
      <div ref={targetRef} className="relative h-[300vh] bg-accent">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Section 1: Hero */}
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
              Cozy Digital Goods
            </h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
              Thoughtfully designed Islamic booklets and wallpapers that bring
              warmth, beauty, and serenity to your day.
            </p>
          </motion.div>

          {/* Section 2: Intro to the series */}
           <motion.div
            style={{ opacity: introOpacity, scale: introScale }}
            className="absolute inset-0 flex items-center justify-center px-4"
          >
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
          </motion.div>
          
          {/* Section 3: Full Series Carousel */}
          <motion.div 
            style={{ opacity: seriesOpacity, scale: seriesScale }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
              The Complete 5-Volume Series
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
              Each volume builds on the last, covering everything from branding and marketing to automation and scaling with Iman.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4 w-full max-w-6xl">
                {ebooks.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id} className="block group">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                          <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                          />
                      </div>
                      <h3 className="mt-4 font-headline text-lg text-center text-foreground transition-colors group-hover:text-primary">{product.name}</h3>
                    </Link>
                ))}
            </div>
             <div className="mt-12">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/products">
                    Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <FeaturedProducts />
      <MadeWithHeart />
    </>
  );
};


export default function HomePage() {
  return <EbookScrollExperience />
}

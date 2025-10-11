
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
import { ProductCard } from '@/components/product-card';

const EbookScrollExperience = () => {
  const ebooks = products.filter((p) => p.category === 'Booklets').slice(0, 5);
  const vol1 = ebooks[0];
  const otherVols = ebooks.slice(1);

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Opacity for Hero Section (Fades out)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  // Animation for Vol 1 (Fades in, then moves and scales)
  const vol1Opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.4, 0.5], [0, 1, 1, 0]);
  const vol1Scale = useTransform(scrollYProgress, [0.2, 0.4], [1, 0.6]);
  const vol1X = useTransform(scrollYProgress, [0.4, 0.5], [0, -100]); // Moves left

  // Animation for "Get Yours Now" button
  const buttonOpacity = useTransform(scrollYProgress, [0.25, 0.35], [1, 0]);

  // Animation for the rest of the series (Carousel)
  const seriesOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  const seriesScale = useTransform(scrollYProgress, [0.4, 0.5], [0.9, 1]);

  return (
    <>
      <div ref={targetRef} className="relative h-[400vh]">
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

          {/* Section 2 & 3 Container */}
          <div className="absolute inset-0">
             {/* Volume 1 Spotlight */}
            <motion.div 
              style={{ opacity: vol1Opacity, scale: vol1Scale, x: vol1X }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                Start Your Journey, Free.
              </h2>
              <div className="w-64">
                <ProductCard product={vol1} />
              </div>
               <motion.div style={{opacity: buttonOpacity}} className="mt-6">
                 <Button asChild size="lg" className="font-bold">
                    <Link href="/cart">
                        <Download className="mr-2 h-5 w-5" />
                        Get Yours Now
                    </Link>
                </Button>
               </motion.div>
            </motion.div>

            {/* Full Series Carousel */}
            <motion.div 
              style={{ opacity: seriesOpacity, scale: seriesScale }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                The Complete Barakah Blueprint
              </h2>
              <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
                A 5-volume series to guide you in building a sincere, halal, and successful business from the ground up.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 md:gap-12 px-4">
                  {ebooks.map((product) => (
                      <ProductCard key={product.id} product={product} />
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
      </div>
      <FeaturedProducts />
      <MadeWithHeart />
    </>
  );
};


export default function HomePage() {
  return <EbookScrollExperience />
}


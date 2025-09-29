import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { FeaturedProducts } from '@/components/featured-products';
import { MadeWithHeart } from '@/components/made-with-heart';

export default function HomePage() {
  return (
    <>
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                Where Creativity Meets Barakah
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Discover cozy wallpapers and Islamic booklets designed to bring
                warmth, beauty, and serenity to your digital life.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" className="font-bold shadow-lg transition-transform hover:scale-105">
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-bold shadow-lg transition-transform hover:scale-105 bg-background/70">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <FeaturedProducts />

      <MadeWithHeart />
    </>
  );
}

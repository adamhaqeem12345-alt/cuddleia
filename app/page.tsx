import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { FeaturedProducts } from '@/components/featured-products';
import { MadeWithHeart } from '@/components/made-with-heart';
import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';

export default function HomePage() {
  const ebooks = products.filter((p) => p.category === 'Booklets');

  return (
    <>
      <section className="bg-accent py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                The Complete Barakah Blueprint
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                A 5-volume series designed to guide you through building a
                sincere, halal, and successful business from the ground up.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="font-bold shadow-lg transition-transform hover:scale-105"
                >
                  <Link href="/products">
                    Explore the Series <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-bold shadow-lg transition-transform hover:scale-105 bg-background/70"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore the 5-Volume Series
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
              Each volume builds upon the last, providing a complete roadmap for
              your entrepreneurial journey.
            </p>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 md:gap-12">
            {ebooks.slice(0, 5).map((product, index) => (
              <AnimateIn key={product.id} delay={index * 150}>
                <ProductCard product={product} />
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts />

      <MadeWithHeart />
    </>
  );
}

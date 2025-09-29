import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products';

const featuredProducts = products.slice(0, 3);

export default function HomePage() {
  return (
    <>
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
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
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div>
            <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
              Handpicked for you. Get started on your journey of beauty and
              reflection with our most popular digital goods.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-20 text-center">
             <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/products">View All Products</Link>
              </Button>
          </div>
        </div>
      </section>

      <section className="bg-accent/20 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://i.postimg.cc/6pCrhLbM/Heading-zip-1.png"
                  alt="Founder of Cuddleia"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                Made with Heart &amp; Soul
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Cuddleia was born from a passion for creating beautiful,
                meaningful digital goods that blend modern aesthetics with
                timeless Islamic values. Each product is crafted with love and a
                prayer that it brings you peace, productivity, and a little
                more barakah.
              </p>
               <Button asChild size="lg" className="font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/about">
                  Read Our Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

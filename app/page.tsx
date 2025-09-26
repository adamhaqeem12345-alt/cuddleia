
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-gradient-to-br from-rose-50 to-rose-200 flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://i.postimg.cc/tJq1n6m2/Heading.png"
            alt="Pink flowers and petals background"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <AnimateIn>
          <div className="relative z-10 text-center px-4">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
              Cozy Digital Goods
            </h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
              Discover thoughtfully designed digital wallpapers, planners, and Islamic booklets that bring warmth and serenity to your day.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/products">Shop Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
              Handpicked for you. Get started on your journey of beauty and reflection with our most popular digital goods.
            </p>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {featuredProducts.map((product, index) => (
              <AnimateIn key={product.id} delay={index * 150}>
                <ProductCard product={product} />
              </AnimateIn>
            ))}
          </div>
          <div className="mt-20 text-center">
            <Button asChild size="lg" variant="secondary" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-rose-50/50 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimateIn>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                 <Image
                    src="https://i.postimg.cc/mD3wWHgC/IMG-2917.jpg"
                    alt="Founder of Cuddleia"
                    fill
                    className="object-cover"
                />
              </div>
            </AnimateIn>
             <AnimateIn delay={150}>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                Made with Heart & Soul
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Cuddleia was born from a passion for creating beautiful, meaningful digital goods that blend modern aesthetics with timeless Islamic values. Each product is crafted with love and a prayer that it brings you peace, productivity, and a little more barakah.
              </p>
              <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/about">Read Our Story <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </AnimateIn>
          </div>
        </div>
      </section>
    </>
  );
}

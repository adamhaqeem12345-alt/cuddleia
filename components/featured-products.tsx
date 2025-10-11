import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { AnimateIn } from './animate-in';
import { Button } from './ui/button';
import Link from 'next/link';

// Now specifically features wallpapers as side products
const featuredWallpapers = products.filter(p => p.category === 'Wallpapers').slice(0, 3);

export function FeaturedProducts() {
    return (
        <section className="py-24 bg-accent">
            <div className="container mx-auto px-4">
            <AnimateIn>
                <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                Cozy Wallpapers
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
                Beautify your digital space with our collection of faith-inspired wallpapers for your tablet and desktop.
                </p>
            </AnimateIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {featuredWallpapers.map((product, index) => (
                <AnimateIn key={product.id} delay={index * 150}>
                    <ProductCard product={product} />
                </AnimateIn>
                ))}
            </div>
            <div className="mt-20 text-center">
                <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg transition-transform hover:scale-105">
                    <Link href="/products">View All Products</Link>
                </Button>
            </div>
            </div>
      </section>
    )
}

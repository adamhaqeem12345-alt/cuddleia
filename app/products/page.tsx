
import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import type { Metadata } from 'next';
import { AnimateIn } from '@/components/animate-in';

export const metadata: Metadata = {
    title: 'All Products | Cuddleia',
    description: 'Browse our full collection of cozy digital wallpapers and thoughtfully designed Islamic booklets.',
}

export default function ProductsPage() {
    const booklets = products.filter((p) => p.category === 'Booklets');
    const wallpapers = products.filter((p) => p.category === 'Wallpapers');

    return (
        <div className="bg-background">
            <div className="bg-accent">
                <section className="container mx-auto px-4 py-20 md:py-28 text-center">
                    <AnimateIn>
                        <div className="relative z-10">
                            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                                All Products
                            </h1>
                            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                                Discover our full collection of digital goods, crafted with love to bring warmth, beauty, and barakah into your life.
                            </p>
                        </div>
                    </AnimateIn>
                </section>
            </div>
            <main className="container mx-auto px-4 py-24 sm:py-32 bg-background">
                <section key="Booklets" className="mb-20">
                    <AnimateIn>
                        <h2 className="font-headline text-4xl font-bold text-foreground mb-10 border-b pb-4">
                            Booklets
                        </h2>
                    </AnimateIn>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                       {booklets.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
                <section key="Wallpapers" className="mb-20">
                    <AnimateIn>
                        <h2 className="font-headline text-4xl font-bold text-foreground mb-10 border-b pb-4">
                            Wallpapers
                        </h2>
                    </AnimateIn>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                        {wallpapers.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

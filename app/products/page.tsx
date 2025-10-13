
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
                <section className="flex h-[40vh] flex-col items-center justify-center">
                    <AnimateIn className="container mx-auto px-4 text-center">
                        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
                            All Products
                        </h1>
                        <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
                            Discover our full collection of digital goods, crafted with love to bring warmth, beauty, and barakah into your life.
                        </p>
                    </AnimateIn>
                </section>
            </div>
            <main className="container mx-auto px-4 py-24 sm:py-32 bg-background">
                <section key="Booklets" className="mb-20">
                    <AnimateIn>
                        <div className="border-b pb-4 mb-10">
                            <h2 className="font-headline text-4xl text-foreground font-bold">
                                Booklets
                            </h2>
                            <p className="mt-2 text-lg text-muted-foreground">The Barakah Blueprint Series</p>
                        </div>
                    </AnimateIn>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                       {booklets.map((product, index) => (
                            <AnimateIn key={product.id} delay={index * 150}>
                                <ProductCard product={product} />
                            </AnimateIn>
                        ))}
                    </div>
                </section>
                <section key="Wallpapers" className="mb-20">
                    <AnimateIn>
                        <h2 className="font-headline text-4xl text-foreground mb-10 border-b pb-4 font-bold">
                            Wallpapers
                        </h2>
                    </AnimateIn>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {wallpapers.map((product, index) => (
                           <AnimateIn key={product.id} delay={index * 150}>
                                <ProductCard product={product} />
                            </AnimateIn>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

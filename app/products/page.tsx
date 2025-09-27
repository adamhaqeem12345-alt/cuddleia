import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { AnimateIn } from '@/components/animate-in';

export const metadata = {
  title: 'All Products | Cuddleia',
  description: 'Browse our full collection of cozy digital wallpapers, planners, and thoughtfully designed Islamic booklets.',
};

export default function ProductsPage() {
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                All Products
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Discover our full collection of digital goods, crafted with love to bring warmth, beauty, and barakah into your life.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24 sm:py-32">
        {categories.map(category => (
            <section key={category} className="mb-20">
                <AnimateIn>
                    <h2 className="font-headline text-4xl font-bold text-foreground mb-10 border-b pb-4">{category}</h2>
                </AnimateIn>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                    {products.filter(p => p.category === category).map((product, index) => (
                    <AnimateIn key={product.id} delay={index * 150}>
                        <ProductCard product={product} />
                    </AnimateIn>
                    ))}
                </div>
            </section>
        ))}
      </div>
    </div>
  );
}

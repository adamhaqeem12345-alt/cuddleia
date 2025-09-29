import { AnimateIn } from '@/components/animate-in';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';

export default function ProductsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <AnimateIn>
          <div className="text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
              All Digital Goods
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Explore our collection of cozy wallpapers and Islamic booklets, designed to bring beauty and barakah to your digital life.
            </p>
          </div>
        </AnimateIn>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {products.map((product, index) => (
            <AnimateIn key={product.id} delay={index * 100}>
              <ProductCard product={product} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </div>
  );
}

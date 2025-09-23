
'use client';
import { Product } from '@/lib/products';
import { ProductCard } from './product-card';

interface ProductShowcaseProps {
  products: Product[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Our Creations</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-foreground/70 font-body">
                Handcrafted with love, just for you.
            </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Our shop is currently empty. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

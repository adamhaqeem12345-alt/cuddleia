
'use client';

import { products } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { AnimateIn } from '@/components/animate-in';

export function FeaturedProducts() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {featuredProducts.map((product, index) => (
        <AnimateIn key={product.id} delay={index * 150}>
          <ProductCard product={product} />
        </AnimateIn>
      ))}
    </div>
  );
}

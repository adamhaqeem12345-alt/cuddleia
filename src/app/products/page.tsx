
import { products } from '@/lib/products';
import { ProductPageContent } from '@/components/product/product-page-content';

export default function ProductsPage() {
  const allProducts = products;
  const categories = ['All', ...new Set(allProducts.map((p) => p.category))];

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground">
          Our Digital Creations
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-foreground/80">
          Browse our collection of cozy wallpapers and insightful booklets.
        </p>
      </div>
      <ProductPageContent products={allProducts} categories={categories} />
    </div>
  );
}

import { ProductPageContent } from '@/components/product/product-page-content';
import { products, categories } from '@/lib/products';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductPageContent products={products} categories={categories} />
    </div>
  );
}

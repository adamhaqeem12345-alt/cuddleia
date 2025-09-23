
import { Hero } from '@/components/home/hero';
import { ProductShowcase } from '@/components/home/product-showcase';
import { products } from '@/lib/products';


export default async function Home() {
  
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <Hero />
        <ProductShowcase products={products} />
      </main>
    </div>
  );
}

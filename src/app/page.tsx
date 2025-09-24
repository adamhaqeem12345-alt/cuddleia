
import { Hero } from '@/components/home/hero';
import { ProductShowcase } from '@/components/home/product-showcase';
import { AboutUs } from '@/components/home/about-us';
import { products } from '@/lib/products';

export default async function Home() {
  return (
    <>
      <Hero />
      <AboutUs />
      <ProductShowcase products={products} />
    </>
  );
}

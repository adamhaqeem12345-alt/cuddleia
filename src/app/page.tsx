
import { Hero } from '@/components/home/hero';
import { ProductShowcase } from '@/components/home/product-showcase';
import { AboutUs } from '@/components/home/about-us';
import { products } from '@/lib/products';

export default async function Home() {
  // Show only a few featured products on the homepage
  const featuredProducts = products.slice(0, 3);

  return (
    <>
      <Hero />
      <AboutUs />
      <ProductShowcase products={featuredProducts} />
    </>
  );
}

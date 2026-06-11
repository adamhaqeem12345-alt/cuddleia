
import { getProducts } from "@/lib/product-service";
import { ProductCard } from "@/components/product-card"; // Import the new client component

export default function ProductsPage() {
  const products = getProducts();
  const booklets = products.filter(p => p.category === 'Booklets');
  const wallpapers = products.filter(p => p.category === 'Wallpapers');

  return (
    <div className="bg-background">
      <div className="bg-rose-50/30">
        <section className="flex h-[40vh] flex-col items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">All Products</h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">Discover our full collection of digital goods, crafted with love to bring warmth, beauty, and barakah into your life.</p>
          </div>
        </section>
      </div>

      <main className="container mx-auto px-4 py-24 sm:py-32 bg-background">
        <section id="booklets" className="mb-20">
           <div className="border-b pb-4 mb-10">
            <h2 className="font-headline text-4xl text-foreground font-bold">Booklets</h2>
            <p className="mt-2 text-lg text-muted-foreground">The Barakah Blueprint Series</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {booklets.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section id="wallpapers" className="mb-20">
          <div className="border-b pb-4 mb-10">
            <h2 className="font-headline text-4xl text-foreground font-bold">Wallpapers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {wallpapers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

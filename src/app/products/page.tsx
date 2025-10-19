
'use client';

import Image from "next/image";
import Link from "next/link";
import { products, Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Info, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ProductPrice } from "@/components/product-price";

const ProductCard = ({ product }: { product: Product }) => {
  const isFree = product.price === 0;
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block p-0">
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${product.imageWidth}/${product.imageHeight}`}}>
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <CardTitle>
            <Link href={`/products/${product.id}`} className="font-bold tracking-tight font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
              {product.name}
            </Link>
          </CardTitle>
          <div className="mt-2">
            <ProductPrice price={product.price} originalPrice={product.originalPrice} />
          </div>
          <p className="text-sm font-body text-muted-foreground line-clamp-3 my-4">{product.description.split('\\n\\n')[0]}</p>
          {product.disclaimer && (
            <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{product.disclaimer}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isFree ? (
          <Button asChild className="w-full rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
             <a href={product.downloadUrl} target="_blank" >
              <Download className="h-5 w-5 mr-2" />
              Download Now
            </a>
          </Button>
        ) : (
          product.bundleIncludes ? (
            <Button asChild size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full">
              <Link href={`/products/${product.id}`}>
                  View Bundle
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  )
}

export default function ProductsPage() {
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


'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { ProductPrice } from "@/components/product-price";
import { FreebieFormDialog } from "@/components/freebie-form-dialog";

export default function Home() {
  const completeCollection = products.find(p => p.id === '010');
  const wallpapers = products.filter(p => p.category === 'Wallpapers').slice(0, 3);
  const freeBook = products.find(p => p.id === '001');
  
  return (
    <>
      <section className="h-[75vh] bg-background flex flex-col items-center justify-center text-center px-4">
        <div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">Where Creativity Meets Barakah</h1>
          <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">Discover cozy wallpapers and Islamic booklets designed to bring warmth, beauty, and serenity to your digital life.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full font-bold">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="relative aspect-[3/4] w-full max-w-xs mx-auto rounded-lg shadow-2xl overflow-hidden group">
              <Image src="https://i.postimg.cc/Dw8v8XB3/Barakah-Business-Blueprint-Vol-I.png" alt="Barakah Business Blueprint Vol. 1 (The Gentle Beginning)" fill className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">The Barakah Business Blueprint</h2>
              <p className="text-lg text-muted-foreground mb-8">A 5-volume series to guide you in building a sincere, halal, and successful business from the ground up. Start your journey today with the first volume, completely free.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {freeBook && <FreebieFormDialog product={freeBook} />}
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/products">Explore the Series</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {completeCollection && (
        <section className="bg-background py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div>
              <h2 className="text-center font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Get The Complete 5-Volume Series</h2>
              <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">Purchase the entire Barakah Blueprint series in one bundle and save! Get all five volumes covering everything from branding and marketing to automation and scaling with Iman.</p>
            </div>
            <div className="flex justify-center">
              <div className="max-w-sm w-full">
                <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group">
                  <CardHeader className="p-0">
                    <Link href={`/products/${completeCollection.id}`} className="block p-0">
                      <div className="relative w-full overflow-hidden aspect-[3/4]">
                        <Image src={completeCollection.imageUrl} alt={completeCollection.name} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="flex-1">
                      <CardTitle className="mb-2">
                         <Link href={`/products/${completeCollection.id}`} className="font-bold tracking-tight font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
                          {completeCollection.name}
                        </Link>
                      </CardTitle>
                      <div className="mb-4">
                        <ProductPrice price={completeCollection.price} originalPrice={completeCollection.originalPrice} />
                      </div>
                      <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">{completeCollection.description.split('\\n\\n')[0]}</p>
                       <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{completeCollection.disclaimer}</span>
                      </div>
                    </div>
                  </CardContent>
                   <CardFooter>
                     <Button asChild size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full">
                        <Link href={`/products/${completeCollection.id}`}>
                           View Details
                        </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
             <div className="mt-20 text-center">
              <Button asChild size="lg" variant="secondary" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/products">
                  View All Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div>
            <h2 className="text-center font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">Cozy Wallpapers</h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">Beautify your digital space with our collection of faith-inspired wallpapers for your tablet and desktop.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {wallpapers.map(product => (
              <Card key={product.id} className="flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group">
                <CardHeader className="p-0">
                  <Link href={`/products/${product.id}`} className="block p-0">
                    <div className="relative w-full overflow-hidden aspect-[4/3]">
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 pointer-events-none" />
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-6">
                  <CardTitle className="mb-2">
                    <Link href={`/products/${product.id}`} className="font-bold tracking-tight font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">
                      {product.name}
                    </Link>
                  </CardTitle>
                   <div className="mb-4">
                      <ProductPrice price={product.price} />
                    </div>
                  <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">{product.description.split('\\n\\n')[0]}</p>
                  <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{product.disclaimer}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild size="lg" className="w-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 rounded-full">
                        <Link href={`/products/${product.id}`}>
                           View Details
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-20 text-center">
            <Button asChild size="lg" variant="secondary" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="https://i.postimg.cc/6pCrhLbM/Heading-zip-1.png" alt="Founder of Cuddleia" fill className="object-cover" />
            </div>
            <div>
              <h2 className="font-headline text-4xl md:text-5xl text-foreground font-bold mb-4">Made with Heart &amp; Soul</h2>
              <p className="text-lg text-muted-foreground mb-6">Cuddleia was born from a passion for creating beautiful, meaningful digital goods that blend modern aesthetics with timeless Islamic values. Each product is crafted with love and a prayer that it brings you peace, productivity, and a little more barakah.</p>
              <Button asChild size="lg" className="rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/about">
                  Read Our Story <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

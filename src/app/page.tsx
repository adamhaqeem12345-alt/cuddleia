import { Sparkles, ArrowRight, Eye, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const products = [
  {
    id: "001",
    name: "Barakah Business Blueprint",
    description: "The Barakah Business Blueprint is a beginner-friendly guidebook designed for Muslims who want to start an online business from zero while staying true to halal principles...",
    price: 15.00,
    imageUrl: "https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png",
  },
  {
    id: "002",
    name: "iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Maroon Series)",
    description: "This is a digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.”",
    price: 6.00,
    imageUrl: "https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png",
  },
  {
    id: "003",
    name: "iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Minimalist Series)",
    description: "A digital Islamic wallpaper featuring floral background and Arabic calligraphy of Allah and Muhammad ﷺ, with the reminder ‘Allah Loves You'.",
    price: 5.00,
    imageUrl: "https://i.postimg.cc/25KS03k1/Islamic-i-Pad-Wallpaper-zip-3.png",
  },
];

const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <div className="h-full">
        <div className="border text-card-foreground group flex h-full transform flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                        alt={product.name}
                        src={product.imageUrl}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                </div>
            </Link>
            <div className="flex flex-1 flex-col p-6">
                <Link href={`/products/${product.id}`} className="flex-grow">
                    <div className="font-semibold tracking-tight mb-2 font-headline text-2xl text-foreground transition-colors duration-300 group-hover:text-primary">{product.name}</div>
                    <div className="text-sm font-body text-foreground/70 line-clamp-3">{product.description}</div>
                </Link>
            </div>
            <div className="flex items-center justify-between gap-4 p-6 pt-0">
                <p className="text-2xl font-headline font-bold text-primary">${product.price.toFixed(2)}</p>
                <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full">
                        <Eye />
                        <span className="sr-only">View Product</span>
                    </Link>
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add to cart
                    </button>
                </div>
            </div>
        </div>
    </div>
);


export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-accent/30 py-28 md:py-40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Welcome to <span className="text-primary">cuddleia</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80 font-body">
              Discover cozy digital wallpapers and thoughtfully designed Islamic booklets that bring warmth and serenity to your day.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Crafted with Love</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-foreground/80 font-body">
              At Cuddleia, we pour our hearts into creating beautiful digital products. From cozy iPad wallpapers to thoughtfully designed Islamic booklets, each creation is made to bring a touch of warmth and serenity into your life.
            </p>
          </div>
          <div className="mt-16 text-center">
            <Link href="#products" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
              <Sparkles className="h-5 w-5" />
              Explore Our Creations
            </Link>
          </div>
        </div>
      </section>
      
      <section id="products" className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Featured Creations</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-foreground/70 font-body">
              A few of our favorite handcrafted digital goods.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
          <div className="mt-16 text-center">
            <Link href="/products" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full">
              Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

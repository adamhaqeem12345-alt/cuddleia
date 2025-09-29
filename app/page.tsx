import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';

const featuredProducts = [
  {
    id: '001',
    name: 'Barakah Business Blueprint',
    price: 15.00,
    priceMYR: '63.15',
    image: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    description: `A beginner-friendly guide for Muslims starting a halal online business from scratch. This is a clear starting point that highlights the essentials, avoids common pitfalls, and helps you take your first steps with confidence.

What you'll learn:
• Business Models: Digital products, dropshipping, or physical goods.
• Platforms: Best platforms to use without wasting money (Shopify, Gumroad, Etsy, Shopee, and more).
• Halal Payments: Guidance on gateways like Toyyibpay, Stripe, and PayPal.
• Branding: Why your own domain builds long-term trust.
• Automation & AI: How tools like n8n and Canva AI can save you hours.
• Marketing: How to effectively market on TikTok, Instagram, and Pinterest.`,
    note: 'All content is AI-generated and all designs are created by me.',
  },
  {
    id: '002',
    name: 'iPad Wallpaper (Maroon Series)',
    price: 6.00,
    priceMYR: '25.26',
    image: 'https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png',
    description: `A digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.”

Key Features:
• Design: High-resolution floral art with a powerful Islamic reminder.
• Resolution: 2048 × 2732 pixels, ensuring a sharp and clear image.
• Orientation: Best for landscape lock screen with a normal clock display and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
    note: 'All wallpaper designs are 100% my work.',
  },
  {
    id: '003',
    name: 'iPad Wallpaper (Minimalist Series)',
    price: 5.00,
    priceMYR: '21.05',
    image: 'https://i.postimg.cc/25KS03k1/Islamic-i-Pad-Wallpaper-zip-3.png',
    description: `A digital Islamic wallpaper featuring a minimalist floral background, Arabic calligraphy of Allah and Muhammad ﷺ, and the gentle reminder ‘Allah Loves You.'

Key Features:
• Design: Elegant, high-resolution minimalist design.
• Resolution: 2048 × 2732 pixels for a crisp and clear display.
• Orientation: Optimized for landscape lock screen use with a normal clock and no widgets.

Compatibility:
• iPad Pro 12.9" (3rd Gen+), iPad Air 10.9", iPad 10th Gen, and other 4:3 tablets.
• Scaled fit for iPad Mini 6.

Please Note:
• This is a digital item only; no physical product will be shipped.
• For personal use only—not for resale or redistribution.
• Not recommended for portrait lock screens.`,
    note: 'All wallpaper designs are 100% my work.',
  },
];


export default function HomePage() {
  return (
    <>
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="relative z-10 text-center">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
              Where Creativity Meets Barakah
            </h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
              Discover cozy wallpapers and Islamic booklets designed to bring
              warmth, beauty, and serenity to your digital life.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold shadow-lg transition-transform hover:scale-105 bg-background/70">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div>
            <h2 className="text-center font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
              Handpicked for you. Get started on your journey of beauty and
              reflection with our most popular digital goods.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-20 text-center">
             <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg transition-transform hover:scale-105">
                <Link href="/products">View All Products</Link>
              </Button>
          </div>
        </div>
      </section>

      <section className="bg-accent/20 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://i.postimg.cc/6pCrhLbM/Heading-zip-1.png"
                  alt="Founder of Cuddleia"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-4">
                Made with Heart &amp; Soul
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Cuddleia was born from a passion for creating beautiful,
                meaningful digital goods that blend modern aesthetics with
                timeless Islamic values. Each product is crafted with love and a
                prayer that it brings you peace, productivity, and a little
                more barakah.
              </p>
               <Button asChild size="lg" className="font-bold shadow-lg transition-transform hover:scale-105">
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

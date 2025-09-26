import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Cuddleia | Our Story',
  description: 'Learn about the heart and soul behind Cuddleia, a passion project dedicated to creating beautiful, meaningful digital goods that blend modern aesthetics with timeless Islamic values.',
};

export default function AboutPage() {
  return (
    <div className="bg-rose-50/50">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <AnimateIn>
          <div className="mb-12">
            <Button asChild variant="ghost">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
          </div>
        </AnimateIn>

        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <div className="relative aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl mb-12">
              <Image
                src="https://i.postimg.cc/mD3wWHgC/IMG-2917.jpg"
                alt="Founder of Cuddleia working"
                fill
                className="object-cover"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </AnimateIn>
          
          <AnimateIn delay={150}>
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground text-center mb-6">
              Our Story
            </h1>
            <div className="prose prose-lg lg:prose-xl max-w-none mx-auto text-muted-foreground font-body text-center">
              <p>
                Cuddleia was born from a simple passion: to create beautiful, meaningful digital goods that blend modern aesthetics with timeless Islamic values.
              </p>
              <p>
                In a fast-paced world, we believe in carving out moments of peace, reflection, and beauty. Each wallpaper, planner, and booklet is more than just a digital file; it's a piece of our heart, crafted with love and a prayer that it brings you tranquility, helps you stay organized, and adds a little more barakah (blessing) to your day.
              </p>
              <p>
                Our mission is to provide thoughtfully designed products that are not only aesthetically pleasing but also spiritually uplifting. We are a small, passionate team dedicated to quality, authenticity, and serving our community with integrity.
              </p>
              <p>
                Thank you for being a part of our journey. We are so grateful for your support and hope our creations bring as much joy to your life as they bring to ours in making them.
              </p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}

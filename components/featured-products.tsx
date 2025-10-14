
import { AnimateIn } from './animate-in';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';


export function FeaturedProducts() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
            <AnimateIn>
                <h2 className="text-center font-headline text-4xl md:text-5xl text-foreground mb-4 font-bold">
                Explore Our Digital Goods
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-16 max-w-3xl mx-auto">
                    We are currently focused on providing high-quality free resources. Check back later for our premium collections.
                </p>
            </AnimateIn>
            <div className="mt-20 text-center">
                <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg transition-transform hover:scale-105">
                    <Link href="/products">View All Products <ArrowRight className="ml-2 h-5 w-5"/></Link>
                </Button>
            </div>
            </div>
      </section>
    )
}

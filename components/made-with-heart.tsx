
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { AnimateIn } from './animate-in';

export function MadeWithHeart() {
    return (
        <section className="bg-background py-24">
            <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <AnimateIn>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                    src="https://picsum.photos/seed/heart/800/600"
                    alt="Founder of Cuddleia"
                    data-ai-hint="desk flatlay"
                    fill
                    className="object-cover"
                    />
                </div>
                </AnimateIn>
                <AnimateIn delay={150}>
                <h2 className="font-headline text-4xl md:text-5xl text-foreground font-bold mb-4">
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
                </AnimateIn>
            </div>
            </div>
      </section>
    )
}

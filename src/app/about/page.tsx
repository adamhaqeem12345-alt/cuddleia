import { AnimateIn } from '@/components/animate-in';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <AnimateIn>
        <section className="relative overflow-hidden bg-accent/30 py-28 md:py-40">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
                About <span className="text-primary">cuddleia</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80 font-body">
                Spreading warmth and serenity through digital creations.
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>
      </AnimateIn>

      <AnimateIn>
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square w-full max-w-md mx-auto">
                <Image
                  src="https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png"
                  alt="About Cuddleia"
                  fill
                  className="rounded-2xl object-cover shadow-lg"
                />
              </div>
              <div className="text-lg text-foreground/80 font-body space-y-6 max-w-xl">
                <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Our Story</h2>
                <p>
                  Cuddleia was born from a simple desire: to create beautiful, cozy, and meaningful digital goods that bring a little bit of light into your everyday life. In a world that's often busy and chaotic, we believe in the power of small moments of peace and reflection.
                </p>
                <p>
                  Our journey started with a passion for design and a deep appreciation for our Islamic faith. We wanted to combine these two loves to create products that are not only aesthetically pleasing but also spiritually uplifting.
                </p>
                <p>
                  From iPad wallpapers that offer a moment of tranquility every time you unlock your screen, to digital booklets designed to help you on your journey of knowledge, every item is crafted with love, care, and a prayer that it brings barakah (blessing) to you.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}

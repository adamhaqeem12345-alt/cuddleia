
import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { Heart, Feather, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About Cuddleia | Our Story',
  description: 'Cuddleia began with honesty, faith, and a dream to create something meaningful. Learn about our story, our values, and the heart behind our cozy digital goods.',
};

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full bg-hero-background py-20 md:py-28 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimateIn>
            <div className="relative z-10 text-center">
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-lg">
                Our <span className="text-primary">Story</span>
              </h1>
              <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Cuddleia began with honesty, faith, and a dream to create something meaningful.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>
      
      <AnimateIn>
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl leading-tight text-foreground">
                From a simple idea to a cozy corner of the internet.
              </h2>
              <div className="prose prose-lg mt-6 max-w-none font-body text-foreground/80 mx-auto space-y-4">
                <p>Cuddleia began as a small dream to bring warmth, beauty, and faith into the digital spaces we use every day. What started with simple wallpapers and booklets has grown into a cozy corner of the internet where faith, creativity, and sincerity come together.</p>
                <p>Every product is made with love written with care, designed with intention, and refined by hand. We believe in honesty, so we want you to know that part of our journey is built with the help of AI. It supports us in writing and shaping ideas, but every decision, design, and final touch is guided by us with heart and faith.</p>
                <p>Our mission is to create digital goods that uplift hearts, inspire faith, and make your screens a place of comfort and reflection.</p>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>
      
      <AnimateIn className="container mx-auto px-4 mb-24 sm:mb-32">
        <div className="relative aspect-video w-full">
            <Image
                alt="Pastel floral graphics background"
                data-ai-hint="pastel flowers"
                src="https://i.postimg.cc/0rg91k8k/IMG-0426.png"
                fill
                className="rounded-2xl object-cover shadow-lg"
            />
        </div>
      </AnimateIn>
      
      <AnimateIn>
        <section className="bg-background py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl">What We Cherish</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
                Our work is guided by these core principles.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Made with Love</h3>
                  <p className="mt-1 text-foreground/80">Every product is created with intention and care. From the words shaped with AI to the design crafted by human hands, each detail is touched by both technology and heart.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Feather />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Gentle &amp; Uplifting</h3>
                  <p className="mt-1 text-foreground/80">Our goal is to bring peace, positivity, and faith-driven encouragement into your everyday digital life.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Aesthetic &amp; Functional</h3>
                  <p className="mt-1 text-foreground/80">We believe beauty and purpose belong together. Our products are designed to look inspiring while also helping you stay organized and focused.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck />
                </div>
                <div>
                  <h3 className="font-headline text-xl">Built on Honesty</h3>
                  <p className="mt-1 text-foreground/80">We’re transparent about how we create. Our process combines faith, human creativity, and the support of AI in writing and ideas. Everything is refined and designed by hand, ensuring each product carries a genuine and personal touch.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>

      <AnimateIn>
        <section className="bg-accent/30 py-24 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl">Meet the Founder</h2>
            <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-8 sm:flex-row">
              <div className="relative h-40 w-40 flex-shrink-0">
                <Image
                  alt="Adam Haqeem"
                  src="https://i.postimg.cc/YS91wKqP/Pink-Blush-Circle-Creative-Logo-Design.png"
                  fill
                  className="rounded-full object-cover shadow-lg"
                />
              </div>
              <div className="text-left">
                <h3 className="font-headline text-2xl">Adam Haqeem</h3>
                <p className="text-primary">Founder &amp; Creator</p>
                <p className="mt-2 text-foreground/80">Adam Haqeem is the heart and soul behind Cuddleia. With a deep love for faith, creativity, and honesty, he pours sincerity into every digital creation. Guided by the belief that digital spaces should inspire peace and purpose, Adam uses both design and the help of AI to craft products that uplift, comfort, and remind us of what truly matters.</p>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}

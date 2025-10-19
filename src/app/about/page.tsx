
import Image from 'next/image';
import type { Metadata } from 'next';
import { Heart, Feather, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Cuddleia | Our Story',
  description: 'Cuddleia began with honesty, faith, and a dream to create something meaningful. Learn about our story, our values, and the heart behind our cozy digital goods.',
  keywords: 'islamic digital products,ipad wallpaper,digital booklets,muslim lifestyle,cuddleia,cozy digital goods,barakah business',
};

const AboutPage = () => {
  return (
    <div className="bg-background">
      <div className="bg-rose-50/30">
        <section className="flex h-[40vh] flex-col items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
              Our <span className="text-primary">Story</span>
            </h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
              Cuddleia began with honesty, faith, and a dream to create something meaningful.
            </p>
          </div>
        </section>
      </div>
      <main className="bg-background">
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl leading-tight text-foreground font-bold">
                From a simple idea to a cozy corner of the internet.
              </h2>
              <div className="prose prose-lg mt-6 max-w-none font-body text-muted-foreground mx-auto space-y-4">
                <p>
                  Cuddleia is born from a simple dream: to bring warmth, beauty, and faith into the digital spaces we inhabit daily. We are just starting on our journey to create a cozy corner of the internet where sincerity and creativity can flourish, beginning with our first collection of digital wallpapers and booklets.
                </p>
                <p>
                  We believe in honesty, so we want to be clear about how our products are made. The foundational content, like the text in our booklets, is generated with the help of AI. Then, every piece is personally and carefully designed, refined, and given its final form by hand. This combination allows us to blend technological efficiency with a heartfelt, human touch in everything we create.
                </p>
                <p>
                  Our mission is to create digital goods that uplift hearts, inspire faith, and make your screens a place of comfort and reflection.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 mb-24 sm:mb-32">
          <div className="relative aspect-video w-full">
            <Image
              alt="Pastel floral graphics background"
              data-ai-hint="pastel flowers"
              src="https://i.postimg.cc/0rg91k8k/IMG-0426.png"
              fill
              className="rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>

        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-headline text-4xl font-bold">What We Cherish</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Our work is guided by these core principles.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Made with Love</h3>
                  <p className="mt-1 text-muted-foreground">
                    Every product is created with intention and care. From the words shaped with AI to the design crafted by human hands, each detail is touched by both technology and heart.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Feather />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Gentle &amp; Uplifting</h3>
                  <p className="mt-1 text-muted-foreground">
                    Our goal is to bring peace, positivity, and faith-driven encouragement into your everyday digital life.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Aesthetic &amp; Functional</h3>
                  <p className="mt-1 text-muted-foreground">
                    We believe beauty and purpose belong together. Our products are designed to look inspiring while also helping you stay organized and focused.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Built on Honesty</h3>
                  <p className="mt-1 text-muted-foreground">
                    We’re transparent about how we create. Our process combines faith, human creativity, and the support of AI in writing and ideas. Everything is refined and designed by hand, ensuring each product carries a genuine and personal touch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-accent/30 py-24 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl font-bold">Meet the Founder</h2>
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
                <h3 className="font-headline text-2xl font-bold">Adam Haqeem</h3>
                <p className="text-primary">Founder &amp; Creator</p>
                <p className="mt-2 text-muted-foreground">
                  Adam Haqeem is the heart and soul behind Cuddleia. With a deep love for faith, creativity, and honesty, he pours sincerity into every digital creation. Guided by the belief that digital spaces should inspire peace and purpose, Adam masterfully blends AI-generated content with his own heartfelt design to craft products that uplift, comfort, and remind us of what truly matters.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;

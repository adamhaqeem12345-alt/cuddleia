
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Feather, Sparkles, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const teamMember = {
    name: 'Adam Haqeem',
    role: 'Founder & Creator',
    bio: 'Adam Haqeem is the heart and soul behind Cuddleia. With a deep love for faith, creativity, and honesty, he pours sincerity into every digital creation. Guided by the belief that digital spaces should inspire peace and purpose, Adam uses both design and the help of AI to craft products that uplift, comfort, and remind us of what truly matters.',
    imageUrl: 'https://i.postimg.cc/Kc9MvNGS/Pink-Blush-Circle-Creative-Logo-Design.png',
  };

  const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-headline text-xl">{title}</h3>
        <p className="mt-1 text-foreground/80">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-accent/30 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="container mx-auto px-4"
        >
          <h1 className="font-headline text-5xl font-bold text-primary sm:text-6xl">Our Story</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
            Cuddleia began with honesty, faith, and a dream to create something meaningful.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto grid grid-cols-1 gap-16 px-4 md:grid-cols-2 md:items-center lg:gap-24">
          <div className="space-y-8">
            <h2 className="font-headline text-4xl leading-tight text-foreground">
              From a simple idea to a cozy corner of the internet.
            </h2>
            <div className="prose prose-lg text-foreground/80 max-w-none font-body">
               <p>
                Cuddleia began as a small dream to bring warmth, beauty, and faith into the digital spaces we use every day. What started with simple wallpapers and booklets has grown into a cozy corner of the internet where faith, creativity, and sincerity come together.
              </p>
              <p>
                Every product is made with love, written with care, designed with intention, and refined by hand. We believe in honesty, so we want you to know that part of our journey is built with the help of AI. It supports us in writing and ideas, but every decision, design, and final touch is guided by us with heart and faith.
              </p>
              <p>
                Our mission is to create digital goods that uplift hearts, inspire faith, and make your screens a place of comfort and reflection.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative h-96 w-full overflow-hidden rounded-2xl shadow-xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1565530999933-3820a631f235?q=80&w=1080&auto=format&fit=crop"
              alt="A graphic background of pastel colored flowers."
              fill
              className="object-cover"
              data-ai-hint="pastel flowers"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          </motion.div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="bg-background py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-headline text-4xl">What We Cherish</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
              Our work is guided by these core principles.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
            <Feature
              icon={<Heart size={24} />}
              title="Made with Love"
              description="Every product is created with intention and care. From the words to the design, each detail is touched by both human heart and thoughtful creativity."
            />
            <Feature
              icon={<Feather size={24} />}
              title="Gentle & Uplifting"
              description="Our goal is to bring peace, positivity, and faith-driven encouragement into your everyday digital life."
            />
            <Feature
              icon={<Sparkles size={24} />}
              title="Aesthetic & Functional"
              description="We believe beauty and purpose belong together. Our products are designed to look inspiring while also helping you stay organized and focused."
            />
            <Feature
              icon={<ShieldCheck size={24} />}
              title="Built on Honesty"
              description="We’re transparent about how we create. Our process combines faith, human creativity, and the support of AI in writing and ideas. Everything is refined and designed by hand, ensuring each product carries a genuine and personal touch."
            />
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="bg-accent/30 py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl">Meet the Founder</h2>
            <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-8 sm:flex-row">
                <div className="relative h-40 w-40 flex-shrink-0">
                <Image
                    src={teamMember.imageUrl}
                    alt={teamMember.name}
                    fill
                    className="rounded-full object-cover shadow-lg"
                />
                </div>
                <div className="text-left">
                <h3 className="font-headline text-2xl">{teamMember.name}</h3>
                <p className="text-primary">{teamMember.role}</p>
                <p className="mt-2 text-foreground/80">{teamMember.bio}</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

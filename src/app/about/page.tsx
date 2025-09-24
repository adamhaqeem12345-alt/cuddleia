
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Feather, Sparkles, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const teamMember = {
    name: 'Fatimah',
    role: 'Founder & Creator',
    bio: 'Fatimah is the heart and soul behind Cuddleia. With a passion for art, faith, and all things cozy, she pours her love into every digital creation, hoping to bring a little bit of warmth and serenity into your digital space.',
    imageUrl: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjcmVhdG9yJTIwYXQlMjB3b3JrfGVufDB8fHx8MTc1ODkwMDEyNHww&ixlib=rb-4.1.0&q=80&w=1080',
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
            Crafting digital goods with love, faith, and honesty.
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
                Cuddleia began with honesty, faith, and a dream to create something meaningful. What started as a small idea grew into a space where love, creativity, and trust come together.
              </p>
              <p>
                We believe in being transparent. Many of our creations are built with the help of AI, but always guided by human intention, care, and our values. Every design, every booklet, every product is thoughtfully crafted to balance modern tools with timeless faith.
              </p>
              <p>
                Our mission is simple: to bring peace, warmth, and inspiration into the digital spaces you visit daily. Whether it is a planner that keeps you grounded, a wallpaper that lifts your spirit, or a booklet that shares wisdom, each piece of Cuddleia carries with it sincerity, faith, and a touch of coziness.
              </p>
              <p>
                Cuddleia is more than just digital goods. It is a reflection of who we are: honest, hopeful, and deeply committed to making life a little lighter, one design at a time.
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
              src="https://images.unsplash.com/photo-1599591876211-782b39a35a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwYm9va2xldHxlbnwwfHx8fDE3NTg1OTk4MTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="A person writing in a journal"
              fill
              className="object-cover"
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
              description="Every product is a labor of love, designed with attention to detail and a personal touch."
            />
            <Feature
              icon={<Feather size={24} />}
              title="Gentle & Uplifting"
              description="We aim to create content that is positive, inspiring, and brings a sense of calm to your day."
            />
            <Feature
              icon={<Sparkles size={24} />}
              title="Aesthetic & Functional"
              description="Our designs are not only beautiful but also practical, helping you organize your digital life with style."
            />
            <Feature
              icon={<ShieldCheck size={24} />}
              title="Built on Honesty"
              description="We believe in transparency and sincerity, from how we create our products to how we interact with you."
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

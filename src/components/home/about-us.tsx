'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AboutUs() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
            },
          }}
          className="text-center"
        >
          <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Crafted with Love
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-foreground/80 font-body">
            At Cuddleia, we pour our hearts into creating beautiful digital products. From cozy iPad wallpapers to thoughtfully designed Islamic booklets, each creation is made to bring a touch of warmth and serenity into your life.
          </p>
        </motion.div>

         <div className="mt-16 text-center">
            <Link href="#products" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                <Sparkles className="h-5 w-5" />
                Explore Our Creations
            </Link>
        </div>
      </div>
    </section>
  );
}

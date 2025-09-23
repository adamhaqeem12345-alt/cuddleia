
'use client';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary/10 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary-foreground/90 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">cuddleia</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80 font-body">
            Discover cozy digital wallpapers and thoughtfully designed Islamic booklets that bring warmth and serenity to your day.
          </p>
        </motion.div>
      </div>
       <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

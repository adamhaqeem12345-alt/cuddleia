
'use client';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-accent/30 py-28 md:py-40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          className="text-center"
        >
          <motion.h1 
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            }}
            className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            Welcome to <span className="text-primary">cuddleia</span>
          </motion.h1>
          <motion.p 
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            }}
            className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80 font-body"
          >
            Discover cozy digital wallpapers and thoughtfully designed Islamic booklets that bring warmth and serenity to your day.
          </motion.p>
        </motion.div>
      </div>
       <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

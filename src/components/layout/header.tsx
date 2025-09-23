
'use client';
import { motion } from 'framer-motion';

export function Header() {

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-24 items-center justify-center px-4">
        <a href="/" className="transition-transform hover:scale-105">
          <h1 className="text-5xl font-headline md:text-6xl text-primary-foreground/90 transition-colors hover:text-primary">
            cuddleia
          </h1>
        </a>
      </div>
    </motion.header>
  );
}

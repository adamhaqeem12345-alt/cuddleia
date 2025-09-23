
'use client';
import { motion } from 'framer-motion';

export function Header() {

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-20 items-center justify-center px-4">
        <a href="/" className="transition-colors hover:text-primary-foreground/70">
          <h1 className="text-4xl font-headline md:text-5xl text-primary-foreground/90">
            cuddleia
          </h1>
        </a>
      </div>
    </motion.header>
  );
}

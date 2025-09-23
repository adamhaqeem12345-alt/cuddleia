'use client';
import { motion } from 'framer-motion';
import { Mail, Briefcase, Bot, Code } from 'lucide-react';
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
            Our Mission
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-foreground/80 font-body">
            Cuddleia is dedicated to empowering the Muslim community by providing expert guidance in modern business, AI-driven automation, and professional website development, all grounded in our shared values.
          </p>
        </motion.div>

        <div className="mt-16 grid max-w-lg mx-auto gap-10 lg:max-w-none lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-headline text-xl font-semibold text-foreground">Halal Business Guidance</h3>
            <p className="mt-2 text-base text-foreground/70">Navigate the world of entrepreneurship with strategies that align with your principles.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-headline text-xl font-semibold text-foreground">AI Automation</h3>
            <p className="mt-2 text-base text-foreground/70">Leverage the power of artificial intelligence to streamline your business and boost efficiency.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Code className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-headline text-xl font-semibold text-foreground">Web Development</h3>
            <p className="mt-2 text-base text-foreground/70">Build a powerful online presence with our expert website design and development services.</p>
          </div>
        </div>

        <div className="mt-20 text-center">
            <h3 className="font-headline text-2xl text-foreground">Have a Project in Mind?</h3>
            <p className="mt-2 text-lg text-foreground/70">Let's work together to bring your vision to life.</p>
             <Link href="mailto:hello@cuddleia.com" className="inline-flex items-center gap-2 mt-4 text-primary font-bold hover:underline">
                <Mail className="h-5 w-5" />
                hello@cuddleia.com
            </Link>
        </div>
      </div>
    </section>
  );
}

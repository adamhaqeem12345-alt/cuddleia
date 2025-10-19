
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Cuddleia',
  description: 'Get in touch with the Cuddleia team. We\'d love to hear from you!',
};

export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="bg-accent">
        <section className="flex h-[40vh] flex-col items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-foreground drop-shadow-lg font-bold">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="mt-4 font-body text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
              Have a question or just want to say hello? We'd love to hear from you.
            </p>
          </div>
        </section>
      </div>

      <main className="container mx-auto px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="flex flex-col justify-center">
                <h2 className="font-headline text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                    Fill out the form and we'll get back to you as soon as possible. You can also reach out to us directly via email.
                </p>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <Mail className="h-6 w-6 text-primary" />
                    <a href="mailto:hello@cuddleia.com" className="font-body text-lg hover:text-primary transition-colors">
                        hello@cuddleia.com
                    </a>
                </div>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-lg">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <Input id="name" type="text" placeholder="Your Name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                 <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input id="subject" type="text" placeholder="Question about a product" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <Textarea id="message" placeholder="Your message here..." rows={5} required />
                </div>
                <div>
                  <Button type="submit" size="lg" className="w-full font-bold rounded-full">
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

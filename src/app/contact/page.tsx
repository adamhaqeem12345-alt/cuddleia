import { AnimateIn } from '@/components/animate-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="bg-background">
      <AnimateIn>
        <section className="relative overflow-hidden bg-accent/30 py-28 md:py-40">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
                Contact <span className="text-primary">Us</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-foreground/80 font-body">
                We'd love to hear from you. Drop us a message below.
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>
      </AnimateIn>

      <AnimateIn>
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <form className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is your message about?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message here..." rows={6} />
                </div>
                <div className="text-center">
                  <Button type="submit" size="lg" className="rounded-full shadow-lg">Send Message</Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}

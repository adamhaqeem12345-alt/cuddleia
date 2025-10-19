
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="bg-background">
      <div className="bg-rose-50/30">
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
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="font-headline text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                  <Button onClick={() => setStatus('idle')} variant="secondary" className="rounded-full">Send Another Message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <Input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <Input id="subject" type="text" placeholder="Question about a product" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                    <Textarea id="message" placeholder="Your message here..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                  </div>
                  <div>
                    <Button type="submit" size="lg" className="w-full font-bold rounded-full" disabled={status === 'sending'}>
                      {status === 'sending' ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                  {status === 'error' && (
                     <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                        <XCircle className="h-5 w-5"/>
                        <span>{error || 'An unexpected error occurred.'}</span>
                     </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

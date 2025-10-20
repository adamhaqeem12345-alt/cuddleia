
'use client';

import { useState, FormEvent, ReactNode } from 'react';
import { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

interface FreebieFormDialogProps {
  product: Product;
  children: ReactNode;
}

export function FreebieFormDialog({ product, children }: FreebieFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState('');

  // Reset form state when the dialog is closed
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setName('');
        setEmail('');
        setPhone('');
        setStatus('idle');
        setError('');
      }, 300); // Delay reset to allow for closing animation
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/freebie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, productId: product.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
    } catch (err: any) {
      console.error("Freebie form submission error:", err);
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {status === 'success' ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="font-headline text-2xl font-bold mb-2">Success!</h3>
                <p className="text-muted-foreground mb-6">Your free guide is on its way to your inbox. Check your email to download it!</p>
                <DialogClose asChild>
                    <Button variant="secondary" className="rounded-full">Close</Button>
                </DialogClose>
            </div>
        ) : (
            <>
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl font-bold">Get Your Free Guide</DialogTitle>
                  <DialogDescription>
                    Enter your details below to receive a download link for "{product.name}" in your email.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4" noValidate>
                  <div>
                    <label htmlFor="freebie-name" className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <Input id="freebie-name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="freebie-email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input id="freebie-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                   <div>
                    <label htmlFor="freebie-phone" className="block text-sm font-medium text-foreground mb-2">Phone Number (Optional)</label>
                    <Input id="freebie-phone" type="text" inputMode="numeric" placeholder="e.g., 60123456789" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full font-bold rounded-full" disabled={status === 'sending'}>
                      {status === 'sending' ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Get Download Link
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
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}

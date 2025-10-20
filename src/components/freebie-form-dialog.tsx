
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import { Product } from '@/lib/products';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

interface FreebieFormDialogProps {
    product: Product;
}

export const FreebieFormDialog = ({ product }: FreebieFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setStatus('idle');
    setError('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form state when dialog is closed
      resetForm();
    }
    setOpen(isOpen);
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
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
            <Download className="mr-2 h-5 w-5" />
            Download Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="font-headline text-2xl font-bold mb-2">Success!</h3>
            <p className="text-muted-foreground">Thank you! Your free guide is on its way to your inbox.</p>
             <DialogFooter className="mt-6">
                <Button onClick={() => setOpen(false)} variant="outline" className="rounded-full">Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Get Your Free Guide</DialogTitle>
              <DialogDescription>
                Enter your details below to receive a download link for "{product.name}" in your inbox.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label htmlFor="freebie-name" className="sr-only">Full Name</label>
                <Input id="freebie-name" type="text" placeholder="Your Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-full"/>
              </div>
              <div>
                <label htmlFor="freebie-email" className="sr-only">Email</label>
                <Input id="freebie-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-full"/>
              </div>
              <div>
                <label htmlFor="freebie-phone" className="sr-only">Phone Number (Optional)</label>
                <Input id="freebie-phone" type="text" placeholder="Phone Number (Optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-full"/>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-full" disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Get My Free Guide'
                  )}
                </Button>
              </DialogFooter>
              {status === 'error' && (
                 <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-start gap-2 mt-4">
                    <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5"/>
                    <span className="break-all">{error || 'An unexpected error occurred.'}</span>
                 </div>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

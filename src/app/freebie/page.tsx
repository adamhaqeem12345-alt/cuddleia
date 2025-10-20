
'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import { products, getProductById } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Download, ArrowLeft, AlertTriangle } from 'lucide-react';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

function FreebieForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const product = getProductById(productId || '');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset state if product changes
    setStatus('idle');
    setError('');
    setName('');
    setEmail('');
    setPhone('');
  }, [productId]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) {
      setError('Product not found. Please go back and try again.');
      return;
    }
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

  if (!product) {
    return (
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="font-headline text-3xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the freebie you're looking for. Please return to the products page and try again.</p>
        <Button asChild className="rounded-full">
            <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
            </Link>
        </Button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="font-headline text-3xl font-bold mb-2">Success!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">Your free guide is on its way to your inbox. Check your email to download "{product.name}"!</p>
        <Button asChild variant="secondary" className="rounded-full">
            <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col items-center text-center md:text-left md:items-start">
            <div className="relative w-48 h-60 md:w-64 md:h-80 mb-6">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain rounded-lg shadow-lg"
                />
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
            <p className="text-muted-foreground mt-2">Get your free copy instantly via email.</p>
        </div>
        <div className="bg-card p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-headline text-2xl font-bold text-center">Enter your details</h3>
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
                <Input id="freebie-phone" type="text" placeholder="e.g., 60123456789" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="pt-2">
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
        </div>
    </div>
  )
}

export default function FreebiePage() {
    return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
            <div className="mb-8">
                <Button asChild variant="ghost" className="rounded-full">
                    <Link href="/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </Button>
            </div>
             <div className="mx-auto max-w-4xl">
                <Suspense fallback={<Loader2 className="mx-auto h-12 w-12 animate-spin" />}>
                    <FreebieForm />
                </Suspense>
             </div>
        </div>
    );
}

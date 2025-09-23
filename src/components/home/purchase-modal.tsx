
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Loader2, Mail, MapPin, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/app/actions';
import { Product } from '@/lib/products';

interface PurchaseModalProps {
  product: Product;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type Step = 'details' | 'location' | 'processing';

export function PurchaseModal({ product, isOpen, setIsOpen }: PurchaseModalProps) {
  const [step, setStep] = useState<Step>('details');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const { toast } = useToast();

  const handleNext = () => {
    if (customerName.trim() && customerEmail.trim()) {
      setStep('location');
    } else {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your name and email.',
      });
    }
  };

  const startCheckout = async (paymentMethod: 'ToyyibPay' | 'PayPal') => {
    setStep('processing');
    
    const result = await createOrder(product, customerName, customerEmail, paymentMethod);

    if (result.url) {
      toast({
        title: 'Order Created!',
        description: 'Redirecting you to complete the payment...',
      });
      // Redirect on the client-side
      window.location.href = result.url;
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not process your order.',
      });
      setStep('location'); // Go back to location step on error
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setTimeout(() => {
        setStep('details');
        setCustomerName('');
        setCustomerEmail('');
    }, 300);
  }

  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <motion.div key="details" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{opacity: 0, x: 50}} transition={{ duration: 0.3 }}>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Your Details</DialogTitle>
              <DialogDescription>
                Just a few details before we proceed to payment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" placeholder="Your Name" className="pl-10" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="Your Email" className="pl-10" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleNext} className="rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">Next</Button>
            </div>
          </motion.div>
        );
      case 'location':
        return (
          <motion.div key="location" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{opacity: 0, x: 50}} transition={{ duration: 0.3 }}>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Choose Your Location</DialogTitle>
              <DialogDescription>
                This helps us provide the best payment experience for you.
              </DialogDescription>
            </DialogHeader>
             <form action={async (formData) => {
                const method = formData.get('paymentMethod') as 'ToyyibPay' | 'PayPal';
                await startCheckout(method);
             }}>
                 <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2">
                    <button type="submit" name="paymentMethod" value="ToyyibPay" className="h-28 flex-col gap-2 text-base rounded-2xl transition-all hover:bg-primary/10 hover:border-primary border bg-transparent p-4 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-primary" />
                        <span>Malaysian Buyer</span>
                    </button>
                    <button type="submit" name="paymentMethod" value="PayPal" className="h-28 flex-col gap-2 text-base rounded-2xl transition-all hover:bg-accent/20 hover:border-accent border bg-transparent p-4 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-accent" />
                        <span>International Buyer</span>
                    </button>
                </div>
            </form>
          </motion.div>
        );
      case 'processing':
        return (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-headline">Processing Your Order</h2>
                <p className="text-muted-foreground text-center">Please wait... we're preparing everything for you.</p>
            </motion.div>
        )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

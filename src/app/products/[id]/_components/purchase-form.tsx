
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createOrder } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const initialState = {
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg py-6">
      {pending ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
    </Button>
  );
}

export function PurchaseForm({ productId }: { productId: string }) {
  const [state, formAction] = useFormState(createOrder.bind(null, productId), initialState);
  const { toast } = useToast();

   useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="w-full space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="font-headline text-base">Your Name</Label>
          <div className="relative mt-2">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="name" name="customerName" placeholder="e.g. Fatimah" required className="pl-10 h-12 text-base" />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="font-headline text-base">Your Email</Label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="email" name="customerEmail" type="email" placeholder="you@example.com" required className="pl-10 h-12 text-base" />
          </div>
        </div>
      </div>
      <SubmitButton />
       {state?.error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{state.error}</p>
        </div>
      )}
    </form>
  );
}

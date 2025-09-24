
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from './_actions/send-message';

const initialState = {
  message: '',
  error: '',
  isSuccess: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
      Submit
    </Button>
  );
}

export default function ContactPage() {
  const [state, formAction] = useActionState(sendMessage, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: state.error,
      });
    }
    if (state.isSuccess) {
      toast({
        title: 'Message Sent!',
        description: "We've received your message and will get back to you shortly.",
      });
    }
  }, [state, toast]);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side */}
          <div className="p-8 md:p-12 bg-card">
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-4xl sm:text-5xl">Contact Us</CardTitle>
                <CardDescription className="pt-4 text-base text-foreground/80">
                  We're here to help! Whether you have a question, feedback, or just want to say hello, feel free to reach out. Fill out the form, and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
          </div>

          {/* Right side */}
          <div className="p-8 md:p-12">
            <CardContent className="p-0">
              <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your message</Label>
                  <Textarea id="message" name="message" placeholder="Let us know how we can help..." required rows={5} />
                </div>
                <SubmitButton />
              </form>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}

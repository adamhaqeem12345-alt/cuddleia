
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Sparkles, Loader2, BookHeart } from 'lucide-react';
import type { Product } from '@/lib/products';
import { generateStory } from '@/ai/flows/story-weaver-flow';

export function StoryWeaver({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    setError(null);
    setStory(null);
    setIsOpen(true);

    try {
      const result = await generateStory({
        productName: product.name,
        productDescription: product.description,
      });
      if (result.story) {
        setStory(result.story);
      } else {
        throw new Error('The storyteller seems to be resting. Please try again in a moment.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleGenerateStory} variant="outline" size="lg" className="flex-1">
        <Sparkles className="mr-2 h-5 w-5 text-primary" />
        Weave a Story
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <BookHeart className="h-6 w-6 text-primary" />
              A Story for You
            </DialogTitle>
            <DialogDescription>
                Inspired by "{product.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 min-h-[150px] flex items-center justify-center">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {error && <p className="text-destructive text-center">{error}</p>}
            {story && <p className="whitespace-pre-line font-body text-foreground/90 leading-relaxed">{story}</p>}
          </div>

          <DialogFooter className="flex-col items-center text-center">
             <p className="text-xs text-muted-foreground italic">
                This story was woven for you by AI, inspired by the essence of our product.
             </p>
             <Button onClick={() => setIsOpen(false)} className="mt-4">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

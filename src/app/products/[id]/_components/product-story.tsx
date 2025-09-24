
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateStory, type StoryWeaverOutput } from '@/ai/flows/story-weaver-flow';
import type { Product } from '@/lib/products';

export function ProductStory({ product }: { product: Product }) {
  const [story, setStory] = useState<StoryWeaverOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await generateStory({
          productName: product.name,
          productDescription: product.description,
        });
        setStory(result);
      } catch (e) {
        console.error('Error generating story:', e);
        setError('Could not weave a story at this time. Please check back later.');
      }
    });
  }, [product]);

  return (
    <div className="mt-8">
      {isPending && (
        <div className="animate-fade-in flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center text-primary/80">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-headline text-lg">Weaving a little story for you...</p>
        </div>
      )}
      
      {!isPending && story && (
         <div className="animate-fade-in space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-8">
            <h3 className="flex items-center gap-3 font-headline text-2xl text-primary">
              <Sparkles className="h-6 w-6" />A Moment of Reflection
            </h3>
            <p className="whitespace-pre-wrap font-body text-lg leading-relaxed text-foreground/80">
              {story.story}
            </p>
          </div>
      )}

      {!isPending && error && (
         <div className="animate-fade-in flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-8 text-center text-destructive/80">
            <p className="font-headline text-lg">{error}</p>
        </div>
      )}
    </div>
  );
}

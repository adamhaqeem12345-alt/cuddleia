
'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { generateStory, type StoryWeaverOutput } from '@/ai/flows/story-weaver-flow';
import type { Product } from '@/lib/products';

export function ProductStory({ product }: { product: Product }) {
  const [story, setStory] = useState<StoryWeaverOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateStory = useCallback(() => {
    startTransition(async () => {
      setStory(null); // Clear previous story before generating a new one
      setError(null);
      try {
        const result = await generateStory({
          productName: product.name,
          productDescription: product.description,
        });
        setStory(result);
      } catch (e) {
        console.error('Error generating story:', e);
        setError('Could not weave a story at this time. Please try again.');
      }
    });
  }, [product]);

  useEffect(() => {
    // Generate the first story on initial component load
    handleGenerateStory();
  }, [handleGenerateStory]);

  const hasGeneratedOnce = story || error;

  return (
    <div className="mt-8">
      {isPending && (
        <div className="animate-fade-in flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center text-primary/80">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-headline text-lg">Weaving a little story for you...</p>
        </div>
      )}
      
      {!isPending && story && (
         <div className="animate-fade-in space-y-6 rounded-xl border border-primary/20 bg-primary/5 p-8">
            <div>
                <h3 className="flex items-center gap-3 font-headline text-2xl text-primary">
                <Sparkles className="h-6 w-6" />A Gentle Story, Woven with a Spark of AI
                </h3>
                <p className="whitespace-pre-wrap font-body text-lg leading-relaxed text-foreground/80 mt-4">
                {story.story}
                </p>
            </div>
             <div className="flex justify-center">
                <Button onClick={handleGenerateStory} variant="ghost" size="sm" className="text-primary/80 hover:text-primary hover:bg-primary/10">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Weave Another Story
                </Button>
            </div>
          </div>
      )}

      {!isPending && error && (
         <div className="animate-fade-in flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-8 text-center text-destructive/80">
            <p className="font-headline text-lg">{error}</p>
             <Button onClick={handleGenerateStory} variant="destructive" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
             </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { products as localProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { AnimateIn } from '@/components/animate-in';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

export default function UploadProductsPage() {
  const firestore = useFirestore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!firestore) {
      setError('Firestore is not initialized.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setError(null);

    try {
      const batch = writeBatch(firestore);
      const productsCollectionRef = collection(firestore, 'products');

      localProducts.forEach((product) => {
        // Use the existing product ID for the document ID
        const docRef = doc(productsCollectionRef, product.id);
        batch.set(docRef, product);
      });

      await batch.commit();
      setUploadSuccess(true);
    } catch (e: any) {
      console.error('Error uploading products:', e);
      setError(e.message || 'An unknown error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 sm:py-16">
      <AnimateIn>
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
            Upload Products to Firestore
          </h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">
            Click the button below to migrate the products from{' '}
            <code className="bg-muted px-1.5 py-1 rounded-md font-mono text-sm">
              src/lib/products.ts
            </code>{' '}
            into the Firestore database. This only needs to be done once.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={handleUpload}
            disabled={isUploading || uploadSuccess}
            className="w-full max-w-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Upload Successful!
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Start Upload
              </>
            )}
          </Button>

          {uploadSuccess && (
            <p className="text-green-600">
              All products have been successfully uploaded to Firestore.
            </p>
          )}

          {error && (
            <p className="text-red-600">
              Error: {error}
            </p>
          )}
        </div>
      </AnimateIn>
    </div>
  );
}

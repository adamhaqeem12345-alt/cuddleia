
import { products } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AnimateIn } from '@/components/animate-in';
import { ProductPrice } from '@/components/product-price';
import { AddToCartButton } from './add-to-cart-button';
import { Info, FileText, Download } from 'lucide-react';
import type { Metadata } from 'next';

// This function tells Next.js which dynamic pages to build
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

// This function generates metadata for each product page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Cuddleia`,
    description: product.description,
    openGraph: {
        title: `${product.name} | Cuddleia`,
        description: product.description,
        images: [
            {
                url: product.imageUrl,
                width: product.imageWidth,
                height: product.imageHeight,
                alt: product.name,
            }
        ]
    }
  };
}


export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <AnimateIn>
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 md:py-24">
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
                    
                    {/* Product Image */}
                    <AnimateIn>
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl border">
                             <Image
                                alt={product.name}
                                src={product.imageUrl}
                                fill
                                className="object-cover"
                                priority // Prioritize loading the main product image
                            />
                        </div>
                    </AnimateIn>
                    
                    {/* Product Details */}
                    <AnimateIn delay={150}>
                        <div className="flex flex-col h-full">
                             <div className="flex-1">
                                <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-3">{product.name}</h1>
                                <ProductPrice price={product.price} className="mb-6" />
                                
                                <div className="prose prose-lg text-foreground/80 max-w-none font-body mb-6">
                                    <p>{product.description}</p>
                                </div>
                                {product.longDescription && (
                                    <div className="prose prose-lg text-foreground/80 max-w-none font-body mb-6 text-sm">
                                        <h3 className="flex items-center gap-2 font-headline text-xl text-foreground"><FileText className="h-5 w-5" /> What&apos;s Inside</h3>
                                        <p style={{ whiteSpace: 'pre-line' }}>{product.longDescription}</p>
                                    </div>
                                )}
                             </div>

                            <div className="mt-auto space-y-6">
                                <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border">
                                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>{product.disclaimer} This is a digital product. You will receive a download link upon purchase.</span>
                                </div>
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </AnimateIn>

                </div>
            </div>
        </div>
    </AnimateIn>
  );
}

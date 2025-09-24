
import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
import { PurchaseForm } from './_components/purchase-form';
import { ProductImage } from './_components/product-image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductPurchasePage({ params }: { params: { id:string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
      <div className="container mx-auto max-w-6xl py-12 px-4 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Product Image */}
          <div className="w-full">
            <ProductImage product={product} />
          </div>

          {/* Right Column: Product Info & Purchase Form */}
          <div className="flex h-full flex-col">
              <Card className="flex flex-1 flex-col">
                  <CardHeader>
                      <CardTitle className="font-headline text-4xl lg:text-5xl">{product.name}</CardTitle>
                      <CardDescription className="font-headline text-3xl lg:text-4xl font-bold text-primary pt-2">{formatCurrency(product.price)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <div className="prose prose-lg text-foreground/80 max-w-none whitespace-pre-line font-body">{product.description}</div>
                  </CardContent>
                  <CardFooter>
                      <PurchaseForm productId={product.id} />
                  </CardFooter>
              </Card>
          </div>
          
        </div>
      </div>
  );
}


import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseForm } from './_components/purchase-form';
import { ProductImage } from './_components/product-image';

export default function ProductPurchasePage({ params }: { params: { id: string } }) {
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
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="sticky top-28">
            <Card className="overflow-hidden border-none shadow-2xl rounded-2xl">
                <ProductImage product={product} />
            </Card>
        </div>

        <div className="flex flex-col h-full">
          <Card className="flex-grow flex flex-col border-none bg-transparent shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-4xl lg:text-5xl text-foreground">{product.name}</CardTitle>
              <p className="font-headline text-3xl lg:text-4xl font-bold text-primary pt-2">{formatCurrency(product.price)}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="prose prose-lg text-foreground/80 max-w-none whitespace-pre-line font-body">{product.description}</div>
            </CardContent>
            <CardFooter className="pt-8">
                <PurchaseForm productId={product.id} />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

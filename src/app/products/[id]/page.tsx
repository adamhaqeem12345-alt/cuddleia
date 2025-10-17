
import { notFound } from 'next/navigation';
import { products, Product } from '@/lib/products';
import { ProductDetails } from '@/components/product-details';

export async function generateStaticParams() {
    return products.map((product) => ({
      id: product.id,
    }));
}

const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
}

const ProductPage = ({ params }: { params: { id: string } }) => {
  const product = getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
};

export default ProductPage;

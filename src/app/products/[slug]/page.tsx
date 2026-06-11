
import { ProductDetails } from '@/components/product-details';
import { products } from '@/lib/product-data';
import { notFound } from 'next/navigation';
import { Product } from '@/interfaces/product';


export async function generateStaticParams() {
    return products.map(product => ({ 
        slug: product.slug
    }));
}


const ProductPage = ({ params }: { params: { slug: string } }) => {
    const product = products.find(p => p.slug === params.slug);

    if (!product) {
        return notFound();
    }

    return <ProductDetails product={product} />;
};

export default ProductPage;

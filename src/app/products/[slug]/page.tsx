
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product-details';

// Re-define the Product interface, as it's no longer imported from a static file.
export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: 'Booklets' | 'Wallpapers';
    downloadUrl?: string;
    disclaimer: string;
    bundleIncludes?: string[];
    bundleProducts?: Product[];
}

// The URL for our product service
const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:3001';

// This is a server-side component, so we can fetch data directly.
const getProduct = async (slug: string): Promise<Product | undefined> => {
    try {
        // We use the new slug-based endpoint in our product service
        const response = await fetch(`${PRODUCT_SERVICE_URL}/products/slug/${slug}` , { cache: 'no-store' }); // Using no-store to ensure fresh data
        if (!response.ok) {
            return undefined; // This will trigger the notFound() page
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        return undefined;
    }
}

const ProductPage = async ({ params }: { params: { slug: string } }) => {
  const product = await getProduct(params.slug);
  
  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
};

export default ProductPage;

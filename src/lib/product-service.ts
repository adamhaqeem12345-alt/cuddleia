
import { products, Product } from './product-data';

/**
 * Retrieves all products.
 * @returns An array of all products.
 */
export function getProducts(): Product[] {
    return products;
}

/**
 * Retrieves a single product by its ID.
 * @param id The ID of the product to retrieve.
 * @returns The product, or undefined if not found.
 */
export function getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
}

/**
 * Retrieves a single product by its slug.
 * If the product is a bundle, it enriches the product with the full details of the bundled items.
 * @param slug The slug of the product to retrieve.
 * @returns The product, or null if not found.
 */
export function getProductBySlug(slug: string): Product | null {
    const product = products.find(p => p.slug === slug);

    if (!product) {
        return null;
    }

    // If it's a bundle, enrich the product with the full bundle details.
    if (product.bundleIncludes) {
        const includedProducts = product.bundleIncludes
            .map(bundleId => products.find(p => p.id === bundleId))
            .filter((p): p is Product => p !== undefined);
        
        return {
            ...product,
            bundleProducts: includedProducts,
        };
    }

    return product;
}

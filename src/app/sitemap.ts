import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/product-service';

/**
 * Generates the sitemap for the Cuddleia website.
 * This file is used by search engines like Google to index the site properly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Use the production URL. Change this to your actual domain when it's live.
  const baseUrl = 'https://cuddleia.com';

  const lastModified = new Date();

  const products = getProducts();

  // Define static routes
  const routes = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
  ];

  // Generate dynamic product routes
  const productEntries = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...productEntries];
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageId: string;
};

export const products: Product[] = [
  {
    id: 'prod_1',
    name: 'Glow Serum',
    description: 'Revitalize your skin with our vitamin-rich glow serum. Perfect for all skin types.',
    price: 45.0,
    category: 'Skincare',
    imageId: 'product-1',
  },
  {
    id: 'prod_2',
    name: 'Sunset Eyeshadow Palette',
    description: 'A collection of 12 vibrant, pigmented shades inspired by warm sunset hues.',
    price: 62.5,
    category: 'Makeup',
    imageId: 'product-2',
  },
  {
    id: 'prod_3',
    name: 'Chic Leather Tote',
    description: 'A timeless and versatile leather tote bag, perfect for work or weekend.',
    price: 150.0,
    category: 'Accessories',
    imageId: 'product-3',
  },
  {
    id: 'prod_4',
    name: 'Hydrating Face Cream',
    description: 'Deeply moisturizes and plumps the skin for a youthful, dewy look.',
    price: 55.0,
    category: 'Skincare',
    imageId: 'product-4',
  },
  {
    id: 'prod_5',
    name: 'Velvet Lipstick Set',
    description: 'A set of three creamy, long-lasting lipsticks in universally flattering shades.',
    price: 70.0,
    category: 'Makeup',
    imageId: 'product-5',
  },
  {
    id: 'prod_6',
    name: 'Aviator Sunglasses',
    description: 'Classic aviator frames with polarized lenses for ultimate style and protection.',
    price: 85.0,
    category: 'Accessories',
    imageId: 'product-6',
  },
  {
    id: 'prod_7',
    name: 'Purifying Clay Mask',
    description: 'A gentle yet effective clay mask to draw out impurities and refine pores.',
    price: 38.0,
    category: 'Skincare',
    imageId: 'product-7',
  },
  {
    id: 'prod_8',
    name: 'Luminous Foundation',
    description: 'A lightweight foundation that provides buildable coverage and a radiant finish.',
    price: 49.99,
    category: 'Makeup',
    imageId: 'product-8',
  },
];

export const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

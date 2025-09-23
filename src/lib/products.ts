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
    name: 'Blossom iPad Wallpaper',
    description: 'A beautiful and calming floral wallpaper to bring tranquility to your screen.',
    price: 5.0,
    category: 'iPad Wallpaper',
    imageId: 'wallpaper-1',
  },
  {
    id: 'prod_2',
    name: 'Serenity Islamic Booklet',
    description: 'A pocket-sized booklet of daily prayers and reflections for peace.',
    price: 12.0,
    category: 'Islamic Booklet',
    imageId: 'booklet-1',
  },
  {
    id: 'prod_3',
    name: 'Nature\'s Calm Wallpaper',
    description: 'A serene nature scene to create a peaceful and focused workspace on your iPad.',
    price: 5.0,
    category: 'iPad Wallpaper',
    imageId: 'wallpaper-2',
  },
];

export const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

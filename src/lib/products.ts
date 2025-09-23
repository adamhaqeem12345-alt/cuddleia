
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

export const products: Product[] = [
  {
    id: 'prod_1',
    name: 'Cozy Autumn iPad Wallpaper',
    description: 'A beautiful, high-resolution wallpaper to bring a touch of autumn to your iPad.',
    price: 5.00,
    category: 'Digital Wallpaper',
    imageUrl: 'https://images.unsplash.com/photo-1623136224345-564506a6c42a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhZXN0aGV0aWMlMjBpcGFkJTIwd2FsbHBhcGVyfGVufDB8fHx8MTc1ODU5OTgxOHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'prod_2',
    name: 'Islamic Reminders Booklet',
    description: 'A pocket-sized booklet of inspiring Islamic quotes and reminders.',
    price: 12.50,
    category: 'Islamic Booklet',
    imageUrl: 'https://images.unsplash.com/photo-1599591876211-782b39a35a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwYm9va2xldHxlbnwwfHx8fDE3NTg1OTk4MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'prod_3',
    name: 'Serene Nature iPad Wallpaper',
    description: 'A calming nature-themed wallpaper to bring tranquility to your screen.',
    price: 5.00,
    category: 'Digital Wallpaper',
    imageUrl: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYWxtaW5nJTIwbmF0dXJlJTIwd2FsbHBhcGVyfGVufDB8fHx8MTc1ODU5OTgxOHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];


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
    name: 'Blush & Beige iPad Wallpaper',
    description: 'Aesthetic, high-resolution wallpaper in a calming blush and beige palette for your iPad.',
    price: 4.50,
    category: 'Digital Wallpaper',
    imageUrl: 'https://images.unsplash.com/photo-1623136224345-564506a6c42a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhZXN0aGV0aWMlMjBpcGFkJTIwd2FsbHBhcGVyfGVufDB8fHx8MTc1ODU5OTgxOHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'prod_2',
    name: 'Daily Dua Booklet',
    description: 'A beautifully designed, printable booklet of essential daily duas and reminders.',
    price: 10.00,
    category: 'Islamic Booklet',
    imageUrl: 'https://images.unsplash.com/photo-1599591876211-782b39a35a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwYm9va2xldHxlbnwwfHx8fDE3NTg1OTk4MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'prod_3',
    name: 'Forest Calm iPad Wallpaper',
    description: 'Bring the tranquility of a forest to your iPad with this serene, nature-inspired wallpaper.',
    price: 4.50,
    category: 'Digital Wallpaper',
    imageUrl: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYWxtaW5nJTIwbmF0dXJlJTIwd2FsbHBhcGVyfGVufDB8fHx8MTc1ODU5OTgxOHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

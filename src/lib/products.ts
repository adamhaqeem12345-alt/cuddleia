
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  downloadUrl: string; // The link to the digital product file
};

export const products: Product[] = [
  {
    id: '001',
    name: 'Barakah Business Blueprint',
    description: 'A practical Muslim guide to starting and growing online business the halal way',
    price: 4.50,
    category: 'Islamic Booklet',
    imageUrl: 'https://overbits.herokuapp.com/pdfconvert/temp/1c505f25fa916c564afe17fa805899e6/Barakah%20Business%20Blueprint%20(by%20Cuddleia).pdf?t=1758603940395',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk' // Replace with your actual download link
  },
  {
    id: 'prod_2',
    name: 'Daily Dua Booklet',
    description: 'A beautifully designed, printable booklet of essential daily duas and reminders.',
    price: 10.00,
    category: 'Islamic Booklet',
    imageUrl: 'https://images.unsplash.com/photo-1599591876211-782b39a35a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwYm9va2xldHxlbnwwfHx8fDE3NTg1OTk4MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    downloadUrl: '#' // Replace with your actual download link
  },
  {
    id: 'prod_3',
    name: 'Forest Calm iPad Wallpaper',
    description: 'Bring the tranquility of a forest to your iPad with this serene, nature-inspired wallpaper.',
    price: 4.50,
    category: 'Digital Wallpaper',
    imageUrl: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYWxtaW5nJTIwbmF0dXJlJTIwd2FsbHBhcGVyfGVufDB8fHx8MTc1ODU5OTgxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    downloadUrl: '#' // Replace with your actual download link
  },
  {
    id: 'prod_4',
    name: 'iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Maroon Series)',
    description: 'A digital Islamic wallpaper featuring floral art and Arabic calligraphy of Allah and Muhammad ﷺ, with the reminder ‘Allah Loves You Forever.’',
    price: 6.00,
    category: 'Digital Wallpaper',
    imageUrl: 'https://overbits.herokuapp.com/pdfconvert/temp/1c505f25fa916c564afe17fa805899e6/Islamic%20iPad%20Wallpaper.zip%20-%202.pdf?t=1758612810610',
    downloadUrl: 'https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk'
  }
];

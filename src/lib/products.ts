
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
    price: 25.00,
    category: 'Islamic Booklet',
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk' // Replace with your actual download link
  }
];


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
  },
  {
    id: '002',
    name: 'iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Maroon Series)',
    description: 'A digital Islamic wallpaper featuring floral art and Arabic calligraphy of Allah and Muhammad ﷺ, with the reminder ‘Allah Loves You Forever.’  ✨ Made for iPad A16 (2048 × 2732 pixels) • Optimized specifically for lock screen use. • Optimized specifically for normal lock screen clock appearance and no widgets in lock screen. • Designed for landscape orientation only. • Crisp and high-resolution for clear display.  📱 Compatible Devices: This wallpaper is suitable for: • iPad Pro 12.9-inch (3rd Gen and newer, including A16). • iPad Air (10.9-inch, landscape lock screen). • iPad (10th Gen, 10.9-inch, landscape lock screen). • iPad Mini 6 (8.3-inch, scaled fit). • Other tablets or devices with similar 4:3 aspect ratio in landscape mode.  ⚠️ Note: Not recommended for portrait lock screen use.  💌 You will receive a high-resolution PNG file delivered directly to your email after payment. No physical item will be shipped. For personal use only. Resale or redistribution is not allowed.',
    price: 6.00,
    category: 'Digital Wallpaper',
    imageUrl: 'https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png',
    downloadUrl: 'https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk'
  }
];

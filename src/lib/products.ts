
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
    description: 'A practical Muslim guide to starting and growing online business the halal way.',
    price: 25.00,
    category: 'Islamic Booklet',
    imageUrl: 'https://i.postimg.cc/WbHNrcfr/Barakah-Business-Blueprint-by-Cuddleia.png',
    downloadUrl: 'https://drive.google.com/file/d/1RUV9y6JLBK99dS6aUQMZY4zAsi7HqEH7/view?usp=drivesdk' // Replace with your actual download link
  },
  {
    id: '002',
    name: 'iPad Wallpaper (Lock Screen, Landscape) – Allah Loves You Forever (Maroon Series)',
    description: 'This is a digital Islamic wallpaper designed with floral art and Arabic calligraphy of Allah and Muhammad ﷺ, along with the reminder “Allah Loves You Forever.” ✨ It’s made for iPad A16 (2048 × 2732 pixels) and works best as a lock screen in landscape orientation with the normal clock display and no widgets. The wallpaper is high-resolution and clear, suitable for iPad Pro 12.9-inch (3rd Gen and newer), iPad Air 10.9-inch, iPad 10th Gen, iPad Mini 6 (scaled fit), and other tablets with a similar 4:3 aspect ratio. ⚠️ Please note, it’s not recommended for portrait lock screens. After purchase, you will receive a high-quality PNG file sent directly to your email. This is a digital item only (no physical shipping), and it’s for personal use only—not for resale or redistribution.',
    price: 6.00,
    category: 'Digital Wallpaper',
    imageUrl: 'https://i.postimg.cc/WbdpVVJV/Islamic-i-Pad-Wallpaper-zip-2.png',
    downloadUrl: 'https://drive.google.com/file/d/1OyatP86tevbHRiazIMEsal09fcFOMSZl/view?usp=drivesdk'
  }
];

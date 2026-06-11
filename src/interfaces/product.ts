
export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    category: 'Booklets' | 'Wallpapers';
    downloadUrl?: string;
    disclaimer: string;
    bundleIncludes?: string[];
    bundleProducts?: Product[];
}

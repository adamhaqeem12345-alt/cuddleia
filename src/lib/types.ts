export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Price in MYR
    priceUSD: number; // Price in USD
    imageUrl: string;
    category: string;
    downloadUrl: string;
}

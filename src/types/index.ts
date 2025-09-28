// Type for product information used in the checkout process and API calls
export interface ProductInfo {
  id: string; // Corresponds to product SKU in PayPal
  name: string;
  price: number; // Price in USD cents
  quantity: number;
}

// Extends ProductInfo for use in the shopping cart UI, possibly with more details
export interface CartItem extends ProductInfo {
  imageUrl: string;
  description: string;
}

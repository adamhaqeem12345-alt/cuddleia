// This is a simple in-memory cache for storing order details temporarily.
// In a production environment, this should be replaced with a more persistent
// storage solution like Redis, a database (e.g., Firestore, Postgres), or another caching service.
// This is to bridge the gap between creating a ToyyibPay bill and receiving the callback.

interface CartItem {
  id: string;
  quantity: number;
}

interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

interface OrderData {
  cart: CartItem[];
  user: UserDetails;
  total: number; // Total in cents
}

const orderCache = new Map<string, OrderData>();

// Cache the order details with a unique key (internalOrderId)
export function cacheOrderDetails(key: string, data: OrderData): void {
  // Set a timeout to automatically clear the cache entry after a certain period (e.g., 1 hour)
  // to prevent memory leaks from abandoned payments.
  const oneHour = 60 * 60 * 1000;
  orderCache.set(key, data);
  setTimeout(() => {
    orderCache.delete(key);
  }, oneHour);
}

// Retrieve the order details using the key
export function getOrderDetails(key: string): OrderData | undefined {
  return orderCache.get(key);
}

// Delete the order details from the cache once processed
export function deleteOrderDetails(key:string): void {
    orderCache.delete(key);
}

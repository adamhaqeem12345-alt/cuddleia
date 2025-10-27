
// This is a simple in-memory cache for pending orders.
// In a real production environment, you would use a database like Redis, Firestore, or a relational DB.

interface CartItemInfo {
  id: string;
  quantity: number;
}

export interface PendingOrder {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  phone: string;
  cart: CartItemInfo[];
  totalAmountUSD: number;
}

const pendingOrders = new Map<string, PendingOrder>();

const ORDER_EXPIRATION_MS = 1000 * 60 * 60; // 1 hour

/**
 * Creates a new pending order, stores it in the cache, and returns its unique ID.
 * @param orderData - The order data to store.
 * @returns The unique ID for the pending order.
 */
export function createPendingOrder(orderData: Omit<PendingOrder, 'id' | 'createdAt'>): string {
  const id = `CUDDLEIA-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newOrder: PendingOrder = {
    id,
    createdAt: Date.now(),
    ...orderData,
  };
  pendingOrders.set(id, newOrder);
  
  // Clean up old orders periodically to prevent memory leaks
  cleanupExpiredOrders();

  return id;
}

/**
 * Retrieves a pending order from the cache.
 * @param id - The unique ID of the order to retrieve.
 * @returns The pending order object, or undefined if not found.
 */
export function getPendingOrder(id: string): PendingOrder | undefined {
  return pendingOrders.get(id);
}

/**
 * Deletes a pending order from the cache after it has been processed.
 * @param id - The unique ID of the order to delete.
 */
export function deletePendingOrder(id: string): void {
  pendingOrders.delete(id);
}

/**
 * Iterates through the cache and removes orders that have expired.
 */
function cleanupExpiredOrders() {
  const now = Date.now();
  for (const [id, order] of pendingOrders.entries()) {
    if (now - order.createdAt > ORDER_EXPIRATION_MS) {
      pendingOrders.delete(id);
      console.log(`Expired pending order ${id} has been removed from the cache.`);
    }
  }
}

// Optional: Run cleanup periodically if the server is long-running
// For serverless functions, this is less critical as memory is ephemeral,
// but it's good practice.
setInterval(cleanupExpiredOrders, ORDER_EXPIRATION_MS / 2);

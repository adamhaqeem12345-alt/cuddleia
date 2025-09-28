/**
 * @fileoverview In-memory order log to prevent duplicate processing.
 *
 * This is a simplified, non-persistent log for demonstration purposes.
 * In a production environment, this should be replaced with a persistent
 * data store like Firestore, Redis, or a transactional database to ensure
 * idempotency across server restarts and multiple instances.
 */

// This Set will store the IDs of all orders that have been successfully processed.
const processedOrderIds = new Set<string>();

/**
 * Checks if an order has already been processed.
 * @param orderId The ID of the order to check.
 * @returns A promise that resolves to true if the order has been processed, false otherwise.
 */
export async function hasOrderBeenProcessed(orderId: string): Promise<boolean> {
  return processedOrderIds.has(orderId);
}

/**
 * Marks an order as having been processed.
 * @param orderId The ID of the order to mark as processed.
 */
export async function markOrderAsProcessed(orderId: string): Promise<void> {
  processedOrderIds.add(orderId);
}

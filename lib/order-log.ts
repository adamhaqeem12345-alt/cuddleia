/**
 * @fileoverview In-memory order log to prevent duplicate processing.
 *
 * This service ensures that an order is only processed once by storing
 * processed order IDs in a simple in-memory Set. This is sufficient
 * to prevent the race condition between the initial API capture call and
 * the delayed PayPal webhook within the typical lifespan of a serverless function.
 *
 * A persistent solution like a database (e.g., Firebase, Firestore, Redis)
 * would be more robust for systems with very long-running processes or
 * requirements to survive full server cluster restarts, but for this specific
 * e-commerce webhook race condition, an in-memory log is a simple and
 * effective solution that avoids introducing external dependencies that can
 * complicate the build process.
 */

// A simple, in-memory Set to store processed order IDs.
const processedOrders = new Set<string>();

/**
 * Checks if an order has already been processed.
 * @param orderId The ID of the order to check.
 * @returns A promise that resolves to true if the order is in the log, false otherwise.
 */
export async function hasOrderBeenProcessed(orderId: string): Promise<boolean> {
  return processedOrders.has(orderId);
}

/**
 * Marks an order as having been processed by adding its ID to the in-memory log.
 * @param orderId The ID of the order to mark as processed.
 */
export async function markOrderAsProcessed(orderId: string): Promise<void> {
  processedOrders.add(orderId);
}

/**
 * @fileoverview Persistent order log using Firebase Realtime Database.
 *
 * This service ensures that an order is only processed once by storing
 * processed order IDs in a persistent database, preventing duplicate
 * fulfillments in a stateless server environment.
 */

import { get, ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';

/**
 * Checks if an order has already been processed by looking it up in Firebase.
 * @param orderId The ID of the order to check.
 * @returns A promise that resolves to true if the order has been processed, false otherwise.
 */
export async function hasOrderBeenProcessed(orderId: string): Promise<boolean> {
  try {
    const orderRef = ref(db, `processedOrders/${orderId}`);
    const snapshot = await get(orderRef);
    // The order is considered processed if a snapshot for that ID exists.
    return snapshot.exists();
  } catch (error) {
    console.error(`Error checking if order ${orderId} has been processed:`, error);
    // Fail-safe: If we can't check the DB, assume it hasn't been processed
    // to avoid preventing a legitimate fulfillment, but log the error.
    return false;
  }
}

/**
 * Marks an order as having been processed by saving its ID to Firebase.
 * @param orderId The ID of the order to mark as processed.
 */
export async function markOrderAsProcessed(orderId: string): Promise<void> {
  try {
    const orderRef = ref(db, `processedOrders/${orderId}`);
    // We store the current timestamp as the value, which can be useful for auditing.
    await set(orderRef, { processedAt: new Date().toISOString() });
  } catch (error) {
    console.error(`Error marking order ${orderId} as processed:`, error);
    // This is a critical failure, as it could lead to duplicate processing later.
    // We re-throw the error to ensure the calling context is aware of the failure.
    throw new Error(`Failed to mark order ${orderId} as processed in the database.`);
  }
}

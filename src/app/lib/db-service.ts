'use server';

/**
 * DEPRECATED: Local filesystem database logic removed.
 * Protocol state is now managed exclusively via Cloud Firestore.
 * This file is neutralized to prevent Git index.lock conflicts.
 */

export async function readDb() {
  return {};
}

export async function writeDb(data: any) {
  return { success: true };
}

'use server';

/**
 * DEPRECATED: Local filesystem database logic removed.
 * Protocol state is now managed exclusively via Cloud Firestore.
 */

export async function readDb() {
  return {};
}

export async function writeDb(data: any) {
  return { success: true };
}

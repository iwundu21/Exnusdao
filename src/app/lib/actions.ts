'use server';

/**
 * DEPRECATED: Local filesystem actions removed.
 * All mutations occur via atomic cloud updates in Firestore.
 */

export async function getProtocolState() {
  return {};
}

export async function saveProtocolState(state: any) {
  return { success: true };
}
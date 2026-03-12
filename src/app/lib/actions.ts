
'use server';

/**
 * DEPRECATED: Local filesystem actions removed.
 * All mutations occur via client-side Firebase SDK.
 */

export async function getProtocolState() {
  return {};
}

export async function saveProtocolState(state: any) {
  return { success: true };
}

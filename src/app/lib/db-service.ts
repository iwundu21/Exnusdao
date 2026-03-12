
'use server';

/**
 * DEPRECATED: This service is neutralized to prevent local filesystem writes 
 * that cause Git indexing locks (index.lock errors) during development.
 * All application data is now stored in the 'exnusdao' Firebase project.
 */

export async function readDb() {
  return {};
}

export async function writeDb(data: any) {
  // Neutralized to unblock Git commits
  return { success: true };
}

'use server';

/**
 * DEPRECATED: Filesystem local database logic removed.
 * Protocol state is now managed via exnusdao Firebase project.
 */

export async function readDb() {
  return {};
}

export async function writeDb(data: any) {
  return { success: true };
}

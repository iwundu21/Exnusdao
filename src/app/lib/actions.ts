
'use server';

import { readDb, writeDb } from './db-service';

export async function getProtocolState() {
  return await readDb();
}

export async function saveProtocolState(state: any) {
  await writeDb(state);
  return { success: true };
}

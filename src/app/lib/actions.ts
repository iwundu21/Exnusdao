
'use server';

import { readDb, writeDb } from './db-service';
import { revalidatePath } from 'next/cache';

export async function getProtocolState() {
  return await readDb();
}

export async function saveProtocolState(state: any) {
  const res = await writeDb(state);
  if (res.success) {
    revalidatePath('/');
  }
  return res;
}

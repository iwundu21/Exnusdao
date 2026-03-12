
'use server';

import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/app/lib/db.json');

export async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default state if file doesn't exist or is invalid
    return {
      treasuryBalance: 3000000,
      rewardVaultBalance: 20000000,
      usdcVaultBalance: 0,
      stakedVaultBalance: 0,
      rewardCap: 300000,
      licenseLimit: 100,
      licensePrice: 5000,
      isPaused: false,
      lastCrankedEpoch: 0,
      networkStartDate: Date.now(),
      validators: [],
      userStakes: [],
      licenses: [],
      proposals: [],
      profiles: {},
      settledEpochs: [],
      lastTransaction: null
    };
  }
}

export async function writeDb(data: any) {
  try {
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(DB_PATH, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error("Database write error:", error);
    return { success: false };
  }
}

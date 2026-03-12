
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/app/lib/db.json');

export async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Database read error:", error);
    return null;
  }
}

export async function writeDb(data: any) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Database write error:", error);
  }
}

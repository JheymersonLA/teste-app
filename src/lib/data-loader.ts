
import { promises as fs } from 'fs';
import path from 'path';
import type { DailyRecord, UserSettings } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'database.json');

// This function reads data from the file system.
// It's marked with `unstable_noStore` to ensure it's always re-executed on each request
// and not cached statically, which is crucial for seeing updated data.
export async function loadData(): Promise<{ settings: UserSettings | null; records: DailyRecord[] }> {
  noStore();
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File does not exist, return initial structure
      return { settings: null, records: [] };
    }
    console.error("Failed to load data:", error);
    // In a real app, you might want to handle this more gracefully
    throw new Error("Failed to load application data.");
  }
}

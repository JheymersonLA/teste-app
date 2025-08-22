
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { DailyRecord, UserSettings } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { isSameDay, parseISO } from 'date-fns';
import { redirect } from 'next/navigation';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'database.json');

async function readData(): Promise<{ settings: UserSettings | null; records: DailyRecord[] }> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File does not exist, return initial structure
      return { settings: null, records: [] };
    }
    throw error;
  }
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function saveSettings(newSettings: UserSettings) {
    const data = await readData();
    data.settings = newSettings;
    await writeData(data);
    revalidatePath('/', 'layout');
}

export async function resetData() {
    const data = { settings: null, records: [] };
    await writeData(data);
    revalidatePath('/', 'layout');
}


export async function addRecord(newRecord: Omit<DailyRecord, 'id'>): Promise<{ success: boolean, message?: string }> {
    try {
      const data = await readData();
      const recordWithId: DailyRecord = { ...newRecord, id: uuidv4() };

      // Prevent duplicate trade records for the same day
      if(recordWithId.type === 'trade') {
        const newRecordDate = parseISO(recordWithId.date);
        const recordExists = data.records.some((r: DailyRecord) => 
            r.type === 'trade' && isSameDay(parseISO(r.date), newRecordDate)
        );
        if (recordExists) {
            return { success: false, message: 'Já existe um registro de trade para esta data.' };
        }
      }
      
      data.records.push(recordWithId);
      await writeData(data);
      
      revalidatePath('/dashboard');
      revalidatePath('/calendar');
      revalidatePath('/projection');

      return { success: true };
    } catch (error: any) {
        console.error("Failed to add record:", error);
        return { success: false, message: error.message };
    }
}

export async function addBankOperation(operation: { type: 'deposit' | 'withdrawal'; value: number }): Promise<{ success: boolean, message?: string }> {
    const newOperation: Omit<DailyRecord, 'id'> = {
        type: operation.type,
        date: new Date().toISOString(),
        returnValue: operation.type === 'deposit' ? operation.value : -operation.value,
    };
    return addRecord(newOperation);
}

export async function deleteRecord(id: string): Promise<{ success: boolean, message?: string }> {
    try {
        const data = await readData();
        data.records = data.records.filter((record: any) => record.id !== id);
        await writeData(data);
        
        revalidatePath('/dashboard');
        revalidatePath('/calendar');
        revalidatePath('/projection');

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete record:", error);
        return { success: false, message: error.message };
    }
}

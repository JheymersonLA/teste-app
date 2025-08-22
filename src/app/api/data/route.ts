import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import type { DailyRecord, UserSettings } from '@/lib/types';
import { isSameDay, parseISO } from 'date-fns';

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

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error reading data:', error);
    return NextResponse.json({ message: 'Error reading data', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();
    let data = await readData();

    if (type === 'settings') {
      data.settings = payload;
    } else if (type === 'record') {
      // Prevent duplicate trade records for the same day
      if(payload.type === 'trade') {
        const newRecordDate = parseISO(payload.date);
        const recordExists = data.records.some((r: DailyRecord) => 
            r.type === 'trade' && isSameDay(parseISO(r.date), newRecordDate)
        );
        if (recordExists) {
            return NextResponse.json({ message: 'Record for this date already exists' }, { status: 409 });
        }
      }
      data.records.push(payload);
    } else if (type === 'reset') {
      data = { settings: null, records: [] };
    } else {
      return NextResponse.json({ message: 'Invalid payload type' }, { status: 400 });
    }

    await writeData(data);
    return NextResponse.json({ message: 'Data updated successfully', data });
  } catch (error: any) {
    console.error('Error writing data:', error);
    return NextResponse.json({ message: 'Error writing data', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { type, payload } = await req.json();
    let data = await readData();

    if (type === 'record') {
      data.records = data.records.map((record: any) =>
        record.id === payload.id ? payload : record
      );
    } else if (type === 'settings') {
      data.settings = payload;
    } else {
      return NextResponse.json({ message: 'Invalid payload type for PUT' }, { status: 400 });
    }

    await writeData(data);
    return NextResponse.json({ message: 'Data updated successfully' });
  } catch (error: any) {
    console.error('Error updating data:', error);
    return NextResponse.json({ message: 'Error updating data', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { type, id } = await req.json();
    let data = await readData();

    if (type === 'record' && id) {
      data.records = data.records.filter((record: any) => record.id !== id);
    } else if (type === 'reset') {
      data = { settings: null, records: [] };
    } else {
      return NextResponse.json({ message: 'Invalid payload type or missing ID for DELETE' }, { status: 400 });
    }

    await writeData(data);
    return NextResponse.json({ message: 'Data deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ message: 'Error deleting data', error: error.message }, { status: 500 });
  }
}

'use client';

import type { ReactNode } from 'react';
import React,
{
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { DailyRecord, UserSettings } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface TradeDataContextType {
  settings: UserSettings | null;
  records: DailyRecord[];
  isLoading: boolean;
  saveSettings: (settings: UserSettings) => void;
  addRecord: (record: Omit<DailyRecord, 'id'>) => Promise<boolean>;
  deleteRecord: (id: string) => void;
  resetData: () => void;
  currentBank: number;
  winRate: number;
}

const TradeDataContext = createContext<TradeDataContextType | undefined>(undefined);



export function TradeDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSettings(data.settings);
        const sortedRecords = (data.records || []).sort((a: DailyRecord, b: DailyRecord) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(sortedRecords);
      } catch (error) {
        console.error("Failed to load data from API", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'settings', payload: newSettings }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to API", error);
    }
  }, []);

  const addRecord = useCallback(async (newRecord: Omit<DailyRecord, 'id'>): Promise<boolean> => {
    try {
      const recordWithId = { ...newRecord, id: uuidv4() };

      // Check if record for this date already exists (client-side check for immediate feedback)
      const recordExists = records.some(r => r.date.split('T')[0] === recordWithId.date.split('T')[0]);
      if (recordExists) {
        console.warn("Record for this date already exists");
        return false;
      }

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'record', payload: recordWithId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRecords(prevRecords => 
        [...prevRecords, recordWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      return true;
    } catch (error) {
        console.error("Failed to add record via API", error);
        return false;
    }
  }, [records]);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'record', id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    } catch (error) {
      console.error("Failed to delete record via API", error);
    }
  }, []);

  const resetData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'reset' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSettings(null);
      setRecords([]);
    } catch (error) {
      console.error("Failed to reset data via API", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const currentBank = useMemo(() => {
    if (!settings) return 0;
    const totalReturns = records.reduce((acc, rec) => acc + rec.returnValue, 0);
    return settings.initialBank + totalReturns;
  }, [settings, records]);

  const winRate = useMemo(() => {
    const totalWins = records.reduce((acc, rec) => acc + rec.wins, 0);
    const totalEntries = records.reduce((acc, rec) => acc + rec.entries, 0);
    return totalEntries > 0 ? (totalWins / totalEntries) * 100 : 0;
  }, [records]);

  const value = {
    settings,
    records,
    isLoading,
    saveSettings,
    addRecord,
    deleteRecord,
    resetData,
    currentBank,
    winRate
  };

  return (
    <TradeDataContext.Provider value={value}>
      {children}
    </TradeDataContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeDataContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeDataProvider');
  }
  return context;
}

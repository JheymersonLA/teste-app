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
import { format, startOfDay } from 'date-fns';

interface TradeDataContextType {
  settings: UserSettings | null;
  records: DailyRecord[];
  isLoading: boolean;
  saveSettings: (settings: UserSettings) => void;
  addRecord: (record: Omit<DailyRecord, 'id'>) => Promise<{ success: boolean, message?: string }>;
  deleteRecord: (id: string) => void;
  resetData: () => void;
  currentBank: number;
  winRate: number;
  addBankOperation: (operation: { type: 'deposit' | 'withdrawal'; value: number }) => Promise<{ success: boolean, message?: string }>;
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

  const addRecord = useCallback(async (newRecord: Omit<DailyRecord, 'id'>): Promise<{ success: boolean, message?: string }> => {
    try {
      const recordWithId: DailyRecord = { ...newRecord, id: uuidv4() };
      
      // Ensure date is set to the start of the day for trade records
      if (recordWithId.type === 'trade') {
        recordWithId.date = startOfDay(new Date(recordWithId.date)).toISOString();
      }

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'record', payload: recordWithId }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const formattedDate = format(new Date(recordWithId.date), 'dd/MM/yyyy');
          const message = `Já existe um registro de trade para ${formattedDate}.`;
          return { success: false, message };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { data } = await response.json();
      setRecords(data.records.sort((a: DailyRecord, b: DailyRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      return { success: true };
    } catch (error: any) {
        console.error("Failed to add record via API", error);
        return { success: false, message: error.message };
    }
  }, []);

  const addBankOperation = useCallback(async (operation: { type: 'deposit' | 'withdrawal'; value: number }): Promise<{ success: boolean, message?: string }> => {
    const newOperation: Omit<DailyRecord, 'id'> = {
        type: operation.type,
        date: new Date().toISOString(),
        returnValue: operation.type === 'deposit' ? operation.value : -operation.value,
    };
    return addRecord(newOperation);
}, [addRecord]);


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
    const tradeRecords = records.filter(r => r.type === 'trade');
    const totalWins = tradeRecords.reduce((acc, rec) => acc + (rec.wins || 0), 0);
    const totalEntries = tradeRecords.reduce((acc, rec) => acc + (rec.entries || 0), 0);
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
    winRate,
    addBankOperation,
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

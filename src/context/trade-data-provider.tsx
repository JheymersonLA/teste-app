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

const SETTINGS_KEY = 'tradeflow_settings';
const RECORDS_KEY = 'tradeflow_records';

export function TradeDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedRecords = localStorage.getItem(RECORDS_KEY);
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords) as DailyRecord[];
        parsedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(parsedRecords);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, []);

  const addRecord = useCallback(async (newRecord: Omit<DailyRecord, 'id'>): Promise<boolean> => {
    try {
      const existingRecords = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]') as DailyRecord[];
      
      const recordExists = existingRecords.some(r => r.date.split('T')[0] === newRecord.date.split('T')[0]);
      if (recordExists) {
        console.warn("Record for this date already exists");
        return false;
      }
      
      const recordWithId = { ...newRecord, id: uuidv4() };
      const updatedRecords = [...existingRecords, recordWithId];
      localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));

      setRecords(prevRecords => 
        [...prevRecords, recordWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      return true;
    } catch (error) {
        console.error("Failed to add record to localStorage", error);
        return false;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const updatedRecords = records.filter((record) => record.id !== id);
      localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
    } catch (error) {
      console.error("Failed to delete record from localStorage", error);
    }
  }, [records]);

  const resetData = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(RECORDS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      setSettings(null);
      setRecords([]);
    } catch (error) {
      console.error("Failed to reset data in localStorage", error);
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

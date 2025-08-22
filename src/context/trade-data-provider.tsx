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

interface TradeDataContextType {
  settings: UserSettings | null;
  records: DailyRecord[];
  isLoading: boolean;
  saveSettings: (settings: UserSettings) => void;
  addRecord: (record: Omit<DailyRecord, 'id'>) => boolean;
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
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      const savedRecords = localStorage.getItem(RECORDS_KEY);

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords).sort((a: DailyRecord, b: DailyRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  }, []);

  const addRecord = useCallback((newRecord: Omit<DailyRecord, 'id'>): boolean => {
    if (records.some(r => r.id === newRecord.date)) {
      return false; // Record for this date already exists
    }
    const recordWithId = { ...newRecord, id: newRecord.date };
    const updatedRecords = [...records, recordWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(updatedRecords);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    return true;
  }, [records]);

  const deleteRecord = useCallback((id: string) => {
    const updatedRecords = records.filter((record) => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
  }, [records]);

  const resetData = useCallback(() => {
    setSettings(null);
    setRecords([]);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(RECORDS_KEY);
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

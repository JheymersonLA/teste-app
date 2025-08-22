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
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch } from "firebase/firestore";

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

const SETTINGS_DOC_ID = 'main_settings';

export function TradeDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch settings
        const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
        const settingsSnap = await getDoc(settingsDocRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as UserSettings);
        }

        // Fetch records
        const recordsCollectionRef = collection(db, "records");
        const recordsSnap = await getDocs(recordsCollectionRef);
        const recordsData = recordsSnap.docs.map(doc => doc.data() as DailyRecord);
        recordsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(recordsData);

      } catch (error) {
        console.error("Failed to load data from Firestore", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
      await setDoc(settingsDocRef, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to Firestore", error);
    }
  }, []);

  const addRecord = useCallback(async (newRecord: Omit<DailyRecord, 'id'>): Promise<boolean> => {
    const recordId = newRecord.date;
    const recordDocRef = doc(db, "records", recordId);

    try {
        const docSnap = await getDoc(recordDocRef);
        if (docSnap.exists()) {
            console.warn("Record for this date already exists");
            return false; 
        }

        const recordWithId = { ...newRecord, id: recordId };
        await setDoc(recordDocRef, recordWithId);

        setRecords(prevRecords => 
            [...prevRecords, recordWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        return true;
    } catch (error) {
        console.error("Failed to add record to Firestore", error);
        return false;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const recordDocRef = doc(db, "records", id);
      await deleteDoc(recordDocRef);
      setRecords(prevRecords => prevRecords.filter((record) => record.id !== id));
    } catch (error) {
      console.error("Failed to delete record from Firestore", error);
    }
  }, []);

  const resetData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Delete all records
      const recordsCollectionRef = collection(db, "records");
      const recordsSnap = await getDocs(recordsCollectionRef);
      const batch = writeBatch(db);
      recordsSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete settings
      const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
      await deleteDoc(settingsDocRef);
      
      setSettings(null);
      setRecords([]);

    } catch (error) {
      console.error("Failed to reset data in Firestore", error);
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

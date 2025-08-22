export interface UserSettings {
  initialBank: number;
  dailyEntryTarget: number; // percentage
  dailyProfitTarget: number; // percentage
}

export interface DailyRecord {
  id: string;
  date: string; // ISO date string for date manipulation
  returnValue: number;
  type: 'trade' | 'deposit' | 'withdrawal';
  // Optional fields, only for 'trade' type
  entries?: number;
  wins?: number;
  losses?: number;
}

export interface UserSettings {
  initialBank: number;
  dailyEntryTarget: number; // percentage
  dailyProfitTarget: number; // percentage
}

export interface DailyRecord {
  id: string; // unique identifier, e.g., ISO date string
  date: string; // ISO date string for date manipulation
  returnValue: number;
  entries: number;
  wins: number;
  losses: number;
}


import type { DailyRecord, UserSettings } from './types';

export function calculateCurrentBank(settings: UserSettings, records: DailyRecord[]): number {
    if (!settings) return 0;
    const totalReturns = records.reduce((acc, rec) => acc + rec.returnValue, 0);
    return settings.initialBank + totalReturns;
}

export function calculateWinRate(records: DailyRecord[]): number {
    const tradeRecords = records.filter(r => r.type === 'trade');
    const totalWins = tradeRecords.reduce((acc, rec) => acc + (rec.wins || 0), 0);
    const totalEntries = tradeRecords.reduce((acc, rec) => acc + (rec.entries || 0), 0);
    return totalEntries > 0 ? (totalWins / totalEntries) * 100 : 0;
}

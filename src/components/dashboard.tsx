'use client';

import { Header } from './header';
import { StatsCards } from './stats-cards';
import { BankEvolutionChart } from './bank-evolution-chart';
import { DailyLogForm } from './daily-log-form';
import { PerformanceHistoryTable } from './performance-history-table';

export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <BankEvolutionChart />
          </div>
          <div>
            <DailyLogForm />
          </div>
        </div>
        <div className="grid gap-4 md:gap-8">
            <PerformanceHistoryTable />
        </div>
      </main>
    </div>
  );
}

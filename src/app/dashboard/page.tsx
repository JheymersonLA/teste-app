'use client';

import { StatsCards } from '@/components/stats-cards';
import { BankEvolutionChart } from '@/components/bank-evolution-chart';
import { DailyLogForm } from '@/components/daily-log-form';
import { PerformanceHistoryTable } from '@/components/performance-history-table';

export default function DashboardPage() {
  return (
    <>
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
    </>
  );
}

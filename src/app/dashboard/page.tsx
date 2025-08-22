'use client';

import { StatsCards } from '@/components/stats-cards';
import { BankEvolutionChart } from '@/components/bank-evolution-chart';
import { DailyLogForm } from '@/components/daily-log-form';
import { PerformanceHistoryTable } from '@/components/performance-history-table';
import { Header } from '@/components/header';
import { useTrade } from '@/context/trade-data-provider';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { settings, isLoading } = useTrade();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !settings) {
      router.replace('/');
    }
  }, [isLoading, settings, router]);

  if (isLoading || !settings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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

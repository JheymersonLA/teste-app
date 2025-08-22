
import { StatsCards } from '@/components/stats-cards';
import { BankEvolutionChart } from '@/components/bank-evolution-chart';
import { DailyLogForm } from '@/components/daily-log-form';
import { PerformanceHistoryTable } from '@/components/performance-history-table';
import { ArrowDown, ArrowUp } from 'phosphor-react';
import { BankOperationDialogWrapper } from '@/components/bank-operation-dialog-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loadData } from '@/lib/data-loader';
import { redirect } from 'next/navigation';
import { calculateCurrentBank, calculateWinRate } from '@/lib/calculations';


export default async function DashboardPage() {
  const { settings, records } = await loadData();

  if (!settings) {
    redirect('/');
  }

  const currentBank = calculateCurrentBank(settings, records);
  const winRate = calculateWinRate(records);
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <StatsCards settings={settings} currentBank={currentBank} winRate={winRate} />
      <div className="grid grid-flow-row-dense gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BankEvolutionChart settings={settings} records={records} />
        </div>
        <div className="flex flex-col gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Operações</CardTitle>
                    <CardDescription>Registre um resultado de trade ou movimente sua banca.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <BankOperationDialogWrapper />
                    <DailyLogForm />
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:col-span-2 xl:col-span-3">
          <PerformanceHistoryTable records={sortedRecords} />
        </div>
      </div>
    </>
  );
}

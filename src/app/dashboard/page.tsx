'use client';

import { StatsCards } from '@/components/stats-cards';
import { BankEvolutionChart } from '@/components/bank-evolution-chart';
import { DailyLogForm } from '@/components/daily-log-form';
import { PerformanceHistoryTable } from '@/components/performance-history-table';
import { useTrade } from '@/context/trade-data-provider';
import { ArrowDown, ArrowUp, Spinner } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { BankOperationDialog } from '@/components/bank-operation-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { settings, isLoading } = useTrade();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [operationType, setOperationType] = useState<'deposit' | 'withdrawal'>('deposit');

  const handleOpenDialog = (type: 'deposit' | 'withdrawal') => {
    setOperationType(type);
    setIsDialogOpen(true);
  }

  useEffect(() => {
    if (!isLoading && !settings) {
      router.replace('/');
    }
  }, [isLoading, settings, router]);

  if (isLoading || !settings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <>
    <BankOperationDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        operationType={operationType} 
    />
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <div className="grid grid-flow-row-dense gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <BankEvolutionChart />
          </div>
          <div className="flex flex-col gap-4 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Operações</CardTitle>
                <CardDescription>Registre um resultado de trade ou movimente sua banca.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="hover:bg-green-600 hover:text-white" onClick={() => handleOpenDialog('deposit')}>
                        <ArrowUp className="mr-2" /> Depósito
                    </Button>
                    <Button variant="outline" className="hover:bg-red-600 hover:text-white" onClick={() => handleOpenDialog('withdrawal')}>
                        <ArrowDown className="mr-2" /> Retirada
                    </Button>
                </div>
                <DailyLogForm />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:col-span-2 xl:col-span-3">
            <PerformanceHistoryTable />
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

'use client';

import { useTrade } from '@/context/trade-data-provider';
import { Setup } from '@/components/setup';
import { Dashboard } from '@/components/dashboard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { settings, isLoading } = useTrade();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {settings ? <Dashboard /> : <Setup />}
    </main>
  );
}

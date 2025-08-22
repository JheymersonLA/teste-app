'use client';

import { useTrade } from '@/context/trade-data-provider';
import { Setup } from '@/components/setup';
import { Spinner } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { settings, isLoading } = useTrade();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && settings) {
      router.replace('/dashboard');
    }
  }, [isLoading, settings, router]);


  if (isLoading || settings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Setup />
    </main>
  );
}

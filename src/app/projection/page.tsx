'use client';

import { ProjectionTable } from '@/components/projection-table';
import { useTrade } from '@/context/trade-data-provider';
import { Spinner } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/header';

export default function ProjectionPage() {
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
            <Spinner className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
        )
    }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <ProjectionTable />
      </main>
    </div>
  );
}

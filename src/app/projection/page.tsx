
'use client';

import { ProjectionTable } from '@/components/projection-table';
import { useTrade } from '@/context/trade-data-provider';


export default function ProjectionPage() {
    const { settings, isLoading } = useTrade();

    if (isLoading || !settings) {
      // The main layout handles the loading state.
      // We can return a skeleton or null here.
      // For simplicity, returning null as loading.tsx will be used on initial page load.
      return null;
    }

  return (
      <ProjectionTable />
  );
}

'use client';

import { Header } from '@/components/header';
import { ProjectionTable } from '@/components/projection-table';

export default function ProjectionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <ProjectionTable />
      </main>
    </div>
  );
}

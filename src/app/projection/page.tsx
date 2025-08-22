
import { ProjectionTable } from '@/components/projection-table';
import { loadData } from '@/lib/data-loader';
import { redirect } from 'next/navigation';
import { calculateCurrentBank } from '@/lib/calculations';

export default async function ProjectionPage() {
    const { settings, records } = await loadData();

    if (!settings) {
      redirect('/');
    }

    const currentBank = calculateCurrentBank(settings, records);

  return (
      <ProjectionTable settings={settings} currentBank={currentBank} />
  );
}

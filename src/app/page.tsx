
import { Setup } from '@/components/setup';
import { loadData } from '@/lib/data-loader';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { settings } = await loadData();

  if (settings) {
    redirect('/dashboard');
  }

  return <Setup />;
}

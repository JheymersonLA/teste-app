
import { TradeCalendar } from '@/components/trade-calendar';
import { loadData } from '@/lib/data-loader';
import { redirect } from 'next/navigation';


export default async function CalendarPage() {
  const { records } = await loadData();
  const { settings } = await loadData();

    if (!settings) {
        redirect('/');
    }

  return (
      <TradeCalendar records={records} />
  );
}

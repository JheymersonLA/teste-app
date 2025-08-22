'use client';

import { useTrade } from '@/context/trade-data-provider';
import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TradeCalendar() {
  const { records } = useTrade();

  const modifiers = useMemo(() => {
    const gainDays: Date[] = [];
    const lossDays: Date[] = [];

    records.forEach(record => {
      const recordDate = parseISO(record.date);
      if (record.returnValue >= 0) {
        gainDays.push(recordDate);
      } else {
        lossDays.push(recordDate);
      }
    });

    return {
      gain: gainDays,
      loss: lossDays,
    };
  }, [records]);

  const modifiersStyles = {
    gain: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      color: 'hsl(var(--primary))',
      fontWeight: 'bold',
    },
    loss: {
      backgroundColor: 'hsl(var(--destructive) / 0.2)',
      color: 'hsl(var(--destructive))',
      fontWeight: 'bold',
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calendário de Performance</CardTitle>
        <CardDescription>
          Visualize seus resultados diários. Verde para ganhos, vermelho para perdas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <style>{`
          .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          }
        `}</style>
        <DayPicker
          locale={ptBR}
          showOutsideDays
          className="p-0 w-full"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-lg font-medium',
            nav: 'space-x-1 flex items-center',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-full font-normal text-sm',
            row: 'flex w-full mt-2',
            cell: 'w-full h-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'w-full h-14 p-0 font-normal aria-selected:opacity-100 rounded-md',
            day_today: 'bg-muted text-muted-foreground font-bold',
          }}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
        />
      </CardContent>
    </Card>
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { DailyRecord, UserSettings } from '@/lib/types';

interface BankEvolutionChartProps {
    settings: UserSettings;
    records: DailyRecord[];
}

export function BankEvolutionChart({ settings, records }: BankEvolutionChartProps) {

  const chartData = useMemo(() => {
    if (!settings || records.length === 0) return [];
    
    const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativeBank = settings.initialBank;
    const data = sortedRecords.map(record => {
      cumulativeBank += record.returnValue;
      return {
        date: format(parseISO(record.date), 'dd/MM'),
        banca: cumulativeBank,
      };
    });

    // Add initial bank value as starting point
    return [{date: "Início", banca: settings.initialBank}, ...data];

  }, [settings, records]);

  if (!settings || records.length === 0) {
    return (
        <Card className="xl:col-span-2 h-full">
        <CardHeader>
          <CardTitle>Evolução da Banca</CardTitle>
          <CardDescription>
            Seu progresso será exibido aqui assim que você adicionar registros.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Sem dados para exibir.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="xl:col-span-2 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Evolução da Banca</CardTitle>
        <CardDescription>
          Progresso do valor da sua banca ao longo do tempo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBanca" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip 
                        cursor={{fill: 'hsl(var(--accent))', opacity: 0.1}}
                        content={<ChartTooltipContent 
                            formatter={(value) => `$ ${Number(value).toFixed(2)}`}
                            labelClassName="font-bold"
                            indicator="dot"
                        />} 
                    />
                    <Area type="monotone" dataKey="banca" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBanca)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import { useTrade } from '@/context/trade-data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bank, Crosshair, TrendUp, Percent } from 'phosphor-react';

export function StatsCards() {
  const { settings, currentBank, winRate } = useTrade();

  if (!settings) return null;

  const dailyEntryTargetValue = (currentBank * (settings.dailyEntryTarget / 100)).toFixed(2);
  const dailyProfitTargetValue = (currentBank * (settings.dailyProfitTarget / 100)).toFixed(2);

  const stats = [
    {
      title: 'Banca Atual',
      value: `R$ ${currentBank.toFixed(2)}`,
      icon: Bank,
      color: 'text-primary',
    },
    {
      title: 'Valor de Entrada Diária',
      value: `R$ ${dailyEntryTargetValue}`,
      description: `${settings.dailyEntryTarget}% da banca`,
      icon: Crosshair,
      color: 'text-yellow-500',
    },
    {
      title: 'Meta de Lucro Diário',
      value: `R$ ${dailyProfitTargetValue}`,
      description: `${settings.dailyProfitTarget}% da banca`,
      icon: TrendUp,
      color: 'text-green-500',
    },
    {
      title: 'Taxa de Acerto',
      value: `${winRate.toFixed(2)}%`,
      icon: Percent,
      color: winRate >= 50 ? 'text-green-500' : 'text-red-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 text-muted-foreground ${stat.color}`} weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

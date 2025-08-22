'use client';

import { useTrade } from '@/context/trade-data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bank, Crosshair, TrendUp, Percent, Spinner } from 'phosphor-react';
import { useState, useEffect } from 'react';

export function StatsCards() {
  const { settings, currentBank, winRate } = useTrade();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  useEffect(() => {
    async function fetchExchangeRate() {
      setIsLoadingRate(true);
      try {
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        if (response.ok) {
          setExchangeRate(data.rate);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate from component", error);
      } finally {
        setIsLoadingRate(false);
      }
    }
    fetchExchangeRate();
  }, []);

  if (!settings) return null;

  const dailyEntryTargetValue = (currentBank * (settings.dailyEntryTarget / 100)).toFixed(2);
  const dailyProfitTargetValue = (currentBank * (settings.dailyProfitTarget / 100)).toFixed(2);

  const stats = [
    {
      title: 'Banca Atual',
      value: `$ ${currentBank.toFixed(2)}`,
      icon: Bank,
      color: 'text-primary',
    },
    {
      title: 'Valor de Entrada Diária',
      value: `$ ${dailyEntryTargetValue}`,
      description: `${settings.dailyEntryTarget}% da banca`,
      icon: Crosshair,
      color: 'text-yellow-500',
    },
    {
      title: 'Meta de Lucro Diário',
      value: `$ ${dailyProfitTargetValue}`,
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

  const renderBrlValue = () => {
    if (isLoadingRate) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Spinner className="h-3 w-3 animate-spin" />
          <span>Carregando cotação...</span>
        </div>
      );
    }
    if (exchangeRate) {
      const convertedValue = currentBank * exchangeRate;
      return (
        <p className="text-xs text-muted-foreground">
          Aprox. <span className="font-semibold">R$ {convertedValue.toFixed(2)}</span>
        </p>
      );
    }
    return (
      <p className="text-xs text-destructive/80">Cotação indisponível</p>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 text-muted-foreground ${stat.color}`} weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {index === 0 ? (
                renderBrlValue()
            ) : (
                stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

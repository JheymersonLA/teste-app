'use client';

import { useTrade } from '@/context/trade-data-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useMemo } from 'react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectionData {
    day: number;
    date: string;
    projectedBank: number;
    dailyProfit: number;
}

export function ProjectionTable() {
  const { settings, currentBank } = useTrade();

  const projectionData: ProjectionData[] = useMemo(() => {
    if (!settings) return [];

    const data: ProjectionData[] = [];
    let projectedBank = currentBank;
    const dailyProfitTarget = settings.dailyProfitTarget / 100;
    const today = new Date();

    for (let i = 1; i <= 90; i++) {
        const dailyProfit = projectedBank * dailyProfitTarget;
        projectedBank += dailyProfit;
        data.push({
            day: i,
            date: format(addDays(today, i), 'dd/MM/yyyy', { locale: ptBR }),
            projectedBank: projectedBank,
            dailyProfit: dailyProfit,
        });
    }

    return data;
  }, [settings, currentBank]);

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Ganhos</CardTitle>
          <CardDescription>Configure suas metas para ver a projeção.</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <p className="text-muted-foreground">Vá para o dashboard e defina suas configurações.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de Ganhos (Próximos 90 Dias)</CardTitle>
        <CardDescription>
          Estimativa de crescimento da sua banca com base na sua meta de lucro diário de {settings.dailyProfitTarget}%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Dia</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Lucro do Dia (R$)</TableHead>
              <TableHead className="text-right">Banca Projetada (R$)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectionData.map((day) => (
              <TableRow key={day.day}>
                <TableCell className="text-center font-medium">{day.day}</TableCell>
                <TableCell>{day.date}</TableCell>
                <TableCell className="text-right text-green-600">
                    +{day.dailyProfit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {day.projectedBank.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


'use client';

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
import type { UserSettings } from '@/lib/types';

interface ProjectionData {
    day: number;
    date: string;
    projectedBank: number;
    dailyProfit: number;
}

interface ProjectionTableProps {
    settings: UserSettings;
    currentBank: number;
}

export function ProjectionTable({ settings, currentBank }: ProjectionTableProps) {
  const projectionData: ProjectionData[] = useMemo(() => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de Ganhos (Próximos 90 Dias)</CardTitle>
        <CardDescription>
          Estimativa de crescimento da sua banca com base na sua meta de lucro diário de {settings.dailyProfitTarget}%. Os cálculos são feitos com juros compostos sobre a banca atual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Dia</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Lucro do Dia ($)</TableHead>
              <TableHead className="text-right">Banca Projetada ($)</TableHead>
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

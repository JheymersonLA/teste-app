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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash } from 'phosphor-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from './ui/badge';

export function PerformanceHistoryTable() {
  const { records, deleteRecord } = useTrade();

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Operações</CardTitle>
          <CardDescription>Nenhum registro encontrado. Adicione um para começar.</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <p className="text-muted-foreground">Seus registros diários aparecerão aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Operações</CardTitle>
        <CardDescription>Veja e gerencie seus registros diários.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Resultado ($)</TableHead>
              <TableHead className="text-center">Entradas</TableHead>
              <TableHead className="text-center">Ganhos</TableHead>
              <TableHead className="text-center">Perdas</TableHead>
              <TableHead className="text-center">Taxa de Acerto</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const winRate = record.entries > 0 ? (record.wins / record.entries) * 100 : 0;
              return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{format(parseISO(record.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell className={`text-right font-semibold ${record.returnValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {record.returnValue >= 0 ? `+$${record.returnValue.toFixed(2)}` : `-$${Math.abs(record.returnValue).toFixed(2)}`}
                </TableCell>
                <TableCell className="text-center">{record.entries}</TableCell>
                <TableCell className="text-center">{record.wins}</TableCell>
                <TableCell className="text-center">{record.losses}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={winRate >= 50 ? 'default' : 'destructive'} className={winRate >= 50 ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}>
                    {winRate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Deletar</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso irá apagar permanentemente o registro de {format(parseISO(record.date), 'dd/MM/yyyy', { locale: ptBR })}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteRecord(record.id)}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

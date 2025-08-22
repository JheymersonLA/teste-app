
'use client';

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
import { Button, buttonVariants } from './ui/button';
import { ArrowDown, ArrowUp, ChartLine, Trash } from 'phosphor-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { DailyRecord } from '@/lib/types';
import { deleteRecord } from '@/app/actions/trade-actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface PerformanceHistoryTableProps {
    records: DailyRecord[];
}


const TypeIndicator = ({ type }: { type: DailyRecord['type'] }) => {
  const baseClasses = "flex items-center gap-2"
  switch (type) {
    case 'deposit':
      return <div className={cn(baseClasses, "text-blue-500")}><ArrowUp weight="bold" /> Depósito</div>;
    case 'withdrawal':
      return <div className={cn(baseClasses, "text-orange-500")}><ArrowDown weight="bold" /> Retirada</div>;
    default:
      return <div className={cn(baseClasses, "text-muted-foreground")}><ChartLine weight="bold" /> Trade</div>;
  }
}

export function PerformanceHistoryTable({ records }: PerformanceHistoryTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const handleDelete = async (id: string) => {
    const result = await deleteRecord(id);
    if(result.success) {
        toast({
            title: "Registro deletado!",
            description: "O registro foi removido com sucesso.",
        });
        router.refresh();
    } else {
        toast({
            variant: "destructive",
            title: "Erro",
            description: result.message || "Não foi possível deletar o registro.",
        });
    }
  }

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
        <CardDescription>Acompanhe todas as suas movimentações e resultados de trade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor ($)</TableHead>
              <TableHead className="text-center">Taxa de Acerto</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const isTrade = record.type === 'trade';
              const winRate = isTrade && record.entries && record.entries > 0 ? (record.wins! / record.entries) * 100 : 0;
              
              let valueColor = '';
              if (record.type === 'trade') {
                valueColor = record.returnValue >= 0 ? 'text-green-600' : 'text-red-600';
              } else if (record.type === 'deposit') {
                valueColor = 'text-blue-500';
              } else if (record.type === 'withdrawal') {
                valueColor = 'text-orange-500';
              }

              const formatValue = (record: DailyRecord) => {
                if (record.type === 'trade') {
                    return record.returnValue >= 0 ? `+$${record.returnValue.toFixed(2)}` : `-$${Math.abs(record.returnValue).toFixed(2)}`;
                }
                if (record.type === 'deposit') {
                    return `+$${record.returnValue.toFixed(2)}`;
                }
                if (record.type === 'withdrawal') {
                    return `-$${Math.abs(record.returnValue).toFixed(2)}`;
                }
                return `$${record.returnValue.toFixed(2)}`;
              }

              return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{format(parseISO(record.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell><TypeIndicator type={record.type}/></TableCell>
                <TableCell className={`text-right font-semibold ${valueColor}`}>
                    {formatValue(record)}
                </TableCell>
                <TableCell className="text-center">
                  {isTrade ? (
                    <Badge variant={winRate >= 50 ? 'default' : 'destructive'} className={cn(winRate >= 50 ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20')}>
                      {winRate.toFixed(1)}%
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="group hover:bg-destructive">
                        <Trash className="h-4 w-4 text-muted-foreground group-hover:text-destructive-foreground" />
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
                        <AlertDialogAction 
                          onClick={() => handleDelete(record.id)}
                          className={cn(buttonVariants({ variant: "destructive" }))}
                        >
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

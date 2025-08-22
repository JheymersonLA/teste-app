'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTrade } from '@/context/trade-data-provider';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const logSchema = z.object({
    date: z.date({
      required_error: 'A data é obrigatória.',
    }),
    returnValue: z.coerce.number(),
    entries: z.coerce.number().int().min(0, { message: 'Deve ser um número positivo.' }),
    wins: z.coerce.number().int().min(0, { message: 'Deve ser um número positivo.' }),
    losses: z.coerce.number().int().min(0, { message: 'Deve ser um número positivo.' }),
  }).refine(data => data.wins + data.losses <= data.entries, {
    message: 'A soma de ganhos e perdas não pode exceder o total de entradas.',
    path: ['entries'],
  });

type LogFormValues = z.infer<typeof logSchema>;

export function DailyLogForm() {
  const { addRecord } = useTrade();
  const { toast } = useToast();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
        date: new Date(),
        returnValue: 0,
        entries: 0,
        wins: 0,
        losses: 0,
    }
  });

  async function onSubmit(data: LogFormValues) {
    const success = await addRecord({
        ...data,
        date: data.date.toISOString(),
    });

    if (success) {
        toast({
            title: "Registro adicionado!",
            description: `Dados de ${format(data.date, 'PPP', { locale: ptBR })} foram salvos.`,
          });
        form.reset({
            date: new Date(),
            returnValue: 0,
            entries: 0,
            wins: 0,
            losses: 0,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Erro",
            description: `Já existe um registro para a data ${format(data.date, 'PPP', { locale: ptBR })}.`,
        });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Operações do Dia</CardTitle>
        <CardDescription>Adicione os resultados do seu dia de trade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Operação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returnValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado do Dia (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Lucro ou prejuízo" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="entries"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Entradas</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="wins"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ganhos</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="losses"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Perdas</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>
            <FormField
                control={form.control}
                name="entries"
                render={() => (
                    <FormItem>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Registro
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

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
    resultType: z.enum(['gain', 'loss'], { required_error: 'Selecione Ganho ou Perda.' }),
    resultValue: z.coerce.number().min(0, { message: 'O valor deve ser positivo.' }),
    entries: z.coerce.number().int().min(0, { message: 'Deve ser um número positivo.' }),
    wins: z.coerce.number().int().min(0, { message: 'Deve ser um número positivo.' }),
    losses: z.coerce.number().int().min(0, { message: 'Deve ser um número positivo.' }),
  }).refine(data => data.wins + data.losses === data.entries, {
    message: 'A soma de ganhos e perdas deve ser igual ao total de entradas.',
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
        resultType: 'gain',
        resultValue: 0,
        entries: 0,
        wins: 0,
        losses: 0,
    }
  });

  async function onSubmit(data: LogFormValues) {
    const returnValue = data.resultType === 'gain' ? data.resultValue : -data.resultValue;

    const success = await addRecord({
        date: data.date.toISOString(),
        returnValue: returnValue,
        entries: data.entries,
        wins: data.wins,
        losses: data.losses,
    });

    if (success) {
        toast({
            title: "Registro adicionado!",
            description: `Dados de ${format(data.date, 'PPP', { locale: ptBR })} foram salvos.`,
          });
        form.reset({
            date: new Date(),
            resultType: 'gain',
            resultValue: 0,
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, field: any) => {
    if (e.target.value === '') {
        field.onChange(0);
    }
  };


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
                name="resultValue"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Resultado do Dia (R$)</FormLabel>
                        <div className='flex items-center gap-2'>
                           <FormField
                                control={form.control}
                                name="resultType"
                                render={({ field: resultTypeField }) => (
                                    <div className='grid grid-cols-2 gap-2 flex-1'>
                                        <Button 
                                            type="button"
                                            variant={resultTypeField.value === 'gain' ? 'default' : 'outline'}
                                            onClick={() => resultTypeField.onChange('gain')}
                                            className={resultTypeField.value === 'gain' ? 'bg-green-600 hover:bg-green-700' : ''}
                                        >
                                            Ganho
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant={resultTypeField.value === 'loss' ? 'destructive' : 'outline'}
                                            onClick={() => resultTypeField.onChange('loss')}
                                        >
                                            Perda
                                        </Button>
                                    </div>
                                )}
                            />
                        </div>
                        <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="0.00" 
                                {...field} 
                                onFocus={handleFocus}
                                onBlur={(e) => handleBlur(e, field)}
                                className="mt-2 text-right" 
                            />
                        </FormControl>
                        <FormMessage />
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
                        <Input type="number" {...field} onFocus={handleFocus} onBlur={(e) => handleBlur(e, field)} />
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
                        <Input type="number" {...field} onFocus={handleFocus} onBlur={(e) => handleBlur(e, field)} />
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
                        <Input type="number" {...field} onFocus={handleFocus} onBlur={(e) => handleBlur(e, field)} />
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

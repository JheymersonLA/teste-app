'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTrade } from '@/context/trade-data-provider';
import { Calendar as CalendarIcon, PlusCircle } from 'phosphor-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const logSchema = z.object({
    date: z.date({
      required_error: 'A data é obrigatória.',
    }),
    resultType: z.enum(['gain', 'loss'], { required_error: 'Selecione Ganho ou Perda.' }),
    resultValue: z.coerce.number().min(0, { message: 'O valor deve ser positivo.' }),
    entries: z.coerce.number().int().min(1, { message: 'Deve ser pelo menos 1.' }),
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

    const result = await addRecord({
        type: 'trade',
        date: data.date.toISOString(),
        returnValue: returnValue,
        entries: data.entries,
        wins: data.wins,
        losses: data.losses,
    });

    if (result.success) {
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
            description: result.message || 'Ocorreu um erro ao adicionar o registro.',
        });
    }
  }

  return (
    <>
    <div className='flex items-center gap-2'>
        <Separator className='flex-1' />
        <span className='text-xs text-muted-foreground'>TRADE</span>
        <Separator className='flex-1' />
    </div>
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
                <FormLabel>Resultado do Dia ($)</FormLabel>
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
                                        className={cn(resultTypeField.value === 'gain' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-600/90 hover:text-primary-foreground', 'h-9')}
                                    >
                                        Ganho
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant={resultTypeField.value === 'loss' ? 'destructive' : 'outline'}
                                        onClick={() => resultTypeField.onChange('loss')}
                                        className={cn(resultTypeField.value === 'loss' ? '' : 'hover:bg-red-600/90 hover:text-destructive-foreground', 'h-9')}
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
        <Button type="submit" className="w-full mt-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Registro de Trade
        </Button>
        </form>
    </Form>
    </>
  );
}

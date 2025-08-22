'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTrade } from '@/context/trade-data-provider';
import { ArrowDown, ArrowUp } from 'phosphor-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const operationSchema = z.object({
  operationType: z.enum(['deposit', 'withdrawal']),
  value: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
});

type OperationFormValues = z.infer<typeof operationSchema>;

export function BankOperationForm() {
  const { addBankOperation } = useTrade();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      operationType: 'deposit',
      value: 0,
    },
  });

  const operationType = form.watch('operationType');

  async function onSubmit(data: OperationFormValues) {
    setIsLoading(true);
    const result = await addBankOperation({
        type: data.operationType,
        value: data.value,
    });

    if (result.success) {
        toast({
            title: "Operação realizada!",
            description: `${data.operationType === 'deposit' ? 'Depósito' : 'Retirada'} de $${data.value.toFixed(2)} registrado com sucesso.`,
        });
        form.reset({
            operationType: 'deposit',
            value: 0,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Erro",
            description: result.message || "Não foi possível registrar a operação.",
        });
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operações da Banca</CardTitle>
        <CardDescription>Faça depósitos ou retiradas da sua banca.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="operationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Operação</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'deposit' ? 'default' : 'outline'}
                      onClick={() => field.onChange('deposit')}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <ArrowUp className="mr-2" /> Depósito
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'withdrawal' ? 'default' : 'outline'}
                      onClick={() => field.onChange('withdrawal')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <ArrowDown className="mr-2" /> Retirada
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processando...' : `Confirmar ${operationType === 'deposit' ? 'Depósito' : 'Retirada'}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

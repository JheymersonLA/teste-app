'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTrade } from '@/context/trade-data-provider';
import { TrendingUp } from 'lucide-react';

const setupSchema = z.object({
  initialBank: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  dailyEntryTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
  dailyProfitTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export function Setup() {
  const { saveSettings } = useTrade();

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      initialBank: 1000,
      dailyEntryTarget: 5,
      dailyProfitTarget: 10,
    },
  });

  function onSubmit(data: SetupFormValues) {
    saveSettings(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
             <TrendingUp className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao TradeFlow</CardTitle>
          <CardDescription>Configure sua banca para começar a gerenciar suas operações.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="initialBank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Inicial da Banca (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dailyEntryTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta de Entrada Diária (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dailyProfitTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta de Lucro Diário (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-semibold">Começar a Usar</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

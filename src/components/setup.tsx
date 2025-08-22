
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChartLineUp } from 'phosphor-react';
import { saveSettings } from '@/app/actions/trade-actions';
import { useRouter } from 'next/navigation';

const setupSchema = z.object({
  initialBank: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  dailyEntryTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
  dailyProfitTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export function Setup() {
  const router = useRouter();

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      initialBank: 1000,
      dailyEntryTarget: 5,
      dailyProfitTarget: 10,
    },
  });

  async function onSubmit(data: SetupFormValues) {
    await saveSettings(data);
    router.push('/dashboard');
    router.refresh(); // Ensure the layout re-renders with the new settings state
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ChartLineUp weight="bold" className="h-6 w-6" />
            </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao TradeFlow</CardTitle>
          <CardDescription>Para começar, configure sua banca e suas metas diárias. Você poderá ajustar esses valores depois.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="initialBank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Inicial da Banca ($)</FormLabel>
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
                    <FormLabel>Percentual de Entrada Diária (%)</FormLabel>
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

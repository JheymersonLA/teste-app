'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTrade } from '@/context/trade-data-provider';
import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';


const settingsSchema = z.object({
  initialBank: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  dailyEntryTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
  dailyProfitTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsDialog() {
  const { settings, saveSettings, resetData } = useTrade();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: settings || undefined,
  });

  function onSubmit(data: SettingsFormValues) {
    saveSettings(data);
    toast({
        title: "Sucesso!",
        description: "Suas configurações foram salvas.",
      })
    setIsOpen(false);
  }

  const handleReset = () => {
    resetData();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configurações</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Ajuste suas metas e o valor da banca aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="initialBank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Inicial da Banca (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                    <Input type="number" {...field} />
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="!mt-8 gap-2 sm:!justify-between">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Resetar Dados
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá apagar permanentemente
                            todos os seus dados, incluindo configurações e registros diários.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

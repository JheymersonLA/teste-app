
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
import { Gear, Trash } from 'phosphor-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import type { UserSettings } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { resetData, saveSettings } from '@/app/actions/trade-actions';
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';

const settingsSchema = z.object({
  initialBank: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  dailyEntryTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
  dailyProfitTarget: z.coerce.number().min(0.1, { message: 'A meta deve ser de pelo menos 0.1%.' }).max(100, { message: 'A meta não pode exceder 100%.' }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsDialogProps {
    settings: UserSettings | null;
}

export function SettingsDialog({ settings }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
        initialBank: 1000,
        dailyEntryTarget: 5,
        dailyProfitTarget: 10
    },
  });

  useEffect(() => {
    if (settings) {
        form.reset(settings);
    }
  }, [settings, form, isOpen])

  async function onSubmit(data: SettingsFormValues) {
    await saveSettings(data);
    toast({
        title: "Sucesso!",
        description: "Suas configurações foram salvas.",
      })
    setIsOpen(false);
    router.refresh();
  }

  async function handleReset() {
    await resetData();
    setIsOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir configurações">
          <Gear className="h-5 w-5" />
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
                  <FormLabel>Valor Inicial da Banca ($)</FormLabel>
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
                  <FormLabel>Percentual de Entrada Diária (%)</FormLabel>
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
            <DialogFooter className="pt-4">
                <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </Form>
        <Separator />
        <div className="space-y-4">
            <div className="space-y-1">
                <h4 className="text-sm font-medium">Zona de Perigo</h4>
                <p className="text-sm text-muted-foreground">
                    Essas ações são destrutivas e não podem ser desfeitas.
                </p>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash className="mr-2 h-4 w-4" /> Resetar Dados
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso irá apagar permanentemente todos os seus
                        dados, incluindo configurações e registros de operações.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleReset}
                      className={cn(buttonVariants({ variant: "destructive" }))}
                    >
                        Sim, resetar dados
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

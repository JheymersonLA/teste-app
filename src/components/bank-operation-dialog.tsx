
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { addBankOperation } from '@/app/actions/trade-actions';
import { useRouter } from 'next/navigation';

const operationSchema = z.object({
  value: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
});

type OperationFormValues = z.infer<typeof operationSchema>;

interface BankOperationDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    operationType: 'deposit' | 'withdrawal';
}

export function BankOperationDialog({ isOpen, setIsOpen, operationType }: BankOperationDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      value: 0,
    },
  });

  const isDeposit = operationType === 'deposit';

  async function onSubmit(data: OperationFormValues) {
    setIsLoading(true);
    const result = await addBankOperation({
        type: operationType,
        value: data.value,
    });

    if (result.success) {
        toast({
            title: "Operação realizada!",
            description: `${isDeposit ? 'Depósito' : 'Retirada'} de $${data.value.toFixed(2)} registrado com sucesso.`,
        });
        form.reset({ value: 0 });
        setIsOpen(false);
        router.refresh();
    } else {
        toast({
            variant: "destructive",
            title: "Erro",
            description: result.message || "Não foi possível registrar a operação.",
        });
    }
    setIsLoading(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
        form.reset({ value: 0 });
        setIsOpen(open);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isDeposit ? 'Realizar Depósito' : 'Realizar Retirada'}</DialogTitle>
          <DialogDescription>
            Insira o valor que você deseja {isDeposit ? 'depositar na' : 'retirar da'} sua banca.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit" 
                className={cn(isDeposit ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')} 
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : `Confirmar ${isDeposit ? 'Depósito' : 'Retirada'}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

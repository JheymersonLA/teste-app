
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'phosphor-react';
import { BankOperationDialog } from './bank-operation-dialog';

export function BankOperationDialogWrapper() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [operationType, setOperationType] = useState<'deposit' | 'withdrawal'>('deposit');
  
    const handleOpenDialog = (type: 'deposit' | 'withdrawal') => {
      setOperationType(type);
      setIsDialogOpen(true);
    }
    
    return (
        <>
            <BankOperationDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setIsDialogOpen} 
                operationType={operationType} 
            />
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="hover:bg-green-600 hover:text-white" onClick={() => handleOpenDialog('deposit')}>
                    <ArrowUp className="mr-2" /> Depósito
                </Button>
                <Button variant="outline" className="hover:bg-red-600 hover:text-white" onClick={() => handleOpenDialog('withdrawal')}>
                    <ArrowDown className="mr-2" /> Retirada
                </Button>
            </div>
        </>
    )
}

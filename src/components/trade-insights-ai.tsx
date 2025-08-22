'use client';

import { useState } from 'react';
import { useTrade } from '@/context/trade-data-provider';
import { getTradeInsights } from '@/ai/flows/trade-insights';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TradeInsightsAI() {
  const { records } = useTrade();
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const [error, setError] = useState('');

  const handleGetInsights = async () => {
    setIsLoading(true);
    setError('');
    setInsights('');

    if (records.length < 5) {
        setError("É necessário ter pelo menos 5 registros para uma análise eficaz.");
        setIsLoading(false);
        return;
    }

    try {
      const tradeHistory = JSON.stringify(records.map(r => ({
          date: r.date,
          result: r.returnValue,
          trades: r.entries,
          wins: r.wins,
          losses: r.losses
      })));

      const response = await getTradeInsights({ tradeHistory });
      setInsights(response.insights);
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao gerar os insights. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setInsights('');
    setError('');
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Análise com Inteligência Artificial</CardTitle>
          <CardDescription>
            Receba insights sobre seu desempenho e identifique padrões em suas operações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A nossa IA analisará seu histórico de trades para encontrar pontos de melhoria,
            vieses comportamentais e oportunidades para otimizar sua estratégia.
          </p>
          <Button onClick={handleGetInsights} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Obter Insights com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!insights || !!error} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{error ? 'Atenção' : 'Insights sobre seu Trading'}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap font-sans leading-relaxed pt-2 max-h-[60vh] overflow-y-auto">
                {error || insights}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeDialog}>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

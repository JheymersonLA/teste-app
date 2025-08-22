'use server';

/**
 * @fileOverview An AI agent that provides insights into a user's past trading performance.
 *  It identifies potential patterns, biases, or areas for improvement in their trading strategy.
 *
 * - getTradeInsights - A function that handles the trade insights generation process.
 * - TradeInsightsInput - The input type for the getTradeInsights function.
 * - TradeInsightsOutput - The return type for the getTradeInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TradeInsightsInputSchema = z.object({
  tradeHistory: z
    .string()
    .describe('A JSON string containing the user trade history.'),
});

export type TradeInsightsInput = z.infer<typeof TradeInsightsInputSchema>;

const TradeInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe(
      'AI-driven analysis of the user past trading performance, identifying potential patterns, biases, or areas for improvement.'
    ),
});

export type TradeInsightsOutput = z.infer<typeof TradeInsightsOutputSchema>;

export async function getTradeInsights(input: TradeInsightsInput): Promise<TradeInsightsOutput> {
  return tradeInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tradeInsightsPrompt',
  input: {schema: TradeInsightsInputSchema},
  output: {schema: TradeInsightsOutputSchema},
  prompt: `You are an expert trading analyst.

  Analyze the following trade history and provide insights into potential patterns, biases, or areas for improvement in the user's trading strategy.
  Provide specific and actionable recommendations.

  Trade History: {{{tradeHistory}}}
  `,
});

const tradeInsightsFlow = ai.defineFlow(
  {
    name: 'tradeInsightsFlow',
    inputSchema: TradeInsightsInputSchema,
    outputSchema: TradeInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

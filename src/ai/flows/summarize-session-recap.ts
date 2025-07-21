'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing key events and decisions from a tabletop role-playing game session.
 *
 * - summarizeSessionRecap - A function that summarizes the session recap.
 * - SummarizeSessionRecapInput - The input type for the summarizeSessionRecap function.
 * - SummarizeSessionRecapOutput - The return type for the summarizeSessionRecap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DebuggableFlow, SupportedLocale } from '@/lib/types';
import { getTranslator } from '@/lib/locales/server';

const SummarizeSessionRecapInputSchema = z.object({
  sessionLog: z
    .string()
    .describe("The complete log of the tabletop role-playing game session."),
  language: z.string().describe('The language for the response (e.g., "en", "zh").'),
  systemPrompt: z.string().optional().describe("An optional system prompt to override the default."),
});
export type SummarizeSessionRecapInput = z.infer<typeof SummarizeSessionRecapInputSchema>;

const SummarizeSessionRecapOutputSchema = z.object({
  summary: z
    .string()
    .describe("A concise summary of the key events and decisions from the session."),
});
export type SummarizeSessionRecapOutput = z.infer<typeof SummarizeSessionRecapOutputSchema>;

export async function summarizeSessionRecap(
  input: SummarizeSessionRecapInput
): Promise<SummarizeSessionRecapOutput> {
  return summarizeSessionRecapFlow(input);
}

const summarizeSessionRecapFlow: DebuggableFlow<SummarizeSessionRecapInput, SummarizeSessionRecapOutput> = ai.defineFlow(
  {
    name: 'summarizeSessionRecapFlow',
    inputSchema: SummarizeSessionRecapInputSchema,
    outputSchema: SummarizeSessionRecapOutputSchema,
  },
  async input => {
    const t = await getTranslator(input.language as SupportedLocale);
    
    const promptText = `
${t('prompts.summarizeSessionRecap.main')}

${t('prompts.summarizeSessionRecap.languageInstruction')}

${t('prompts.summarizeSessionRecap.sessionLogHeader')}:
{{{sessionLog}}}`;

    const prompt = ai.definePrompt({
      name: 'summarizeSessionRecapPrompt',
      input: {schema: SummarizeSessionRecapInputSchema},
      output: {schema: SummarizeSessionRecapOutputSchema},
      system: input.systemPrompt,
      prompt: promptText,
    });

    const {output} = await prompt(input);
    return output!;
  }
);

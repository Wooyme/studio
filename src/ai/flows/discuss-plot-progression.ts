'use server';
/**
 * @fileOverview A flow for players to discuss plot progression with the AI DM.
 *
 * - discussPlotProgression - A function that handles plot discussion.
 * - DiscussPlotProgressionInput - The input type for the function.
 * - DiscussPlotProgressionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DebuggableFlow, SupportedLocale } from '@/lib/types';
import { getTranslations } from '@/lib/locales/server';

const DiscussPlotProgressionInputSchema = z.object({
  playerQuery: z.string().describe('The player’s question or topic for discussion.'),
  gameState: z.string().describe('The current game state, including dialogue history, inventory, and journal entries.'),
  language: z.string().describe('The language for the response (e.g., "en", "zh").'),
  systemPrompt: z.string().optional().describe("An optional system prompt to override the default."),
});
export type DiscussPlotProgressionInput = z.infer<typeof DiscussPlotProgressionInputSchema>;

const DiscussPlotProgressionOutputSchema = z.object({
  dmResponse: z.string().describe('The AI Dungeon Master’s response to the player’s query, providing hints or suggestions collaboratively.'),
});
export type DiscussPlotProgressionOutput = z.infer<typeof DiscussPlotProgressionOutputSchema>;

export async function discussPlotProgression(input: DiscussPlotProgressionInput): Promise<DiscussPlotProgressionOutput> {
  return discussPlotProgressionFlow(input);
}

const discussPlotProgressionFlow: DebuggableFlow<DiscussPlotProgressionInput, DiscussPlotProgressionOutput> = ai.defineFlow(
  {
    name: 'discussPlotProgressionFlow',
    inputSchema: DiscussPlotProgressionInputSchema,
    outputSchema: DiscussPlotProgressionOutputSchema,
  },
  async input => {
    const t = await getTranslations(input.language as SupportedLocale);

    const promptText = `
${t('prompts.discussPlotProgression.main')}

${t('prompts.discussPlotProgression.responseLanguage')}: {{{language}}}.

${t('prompts.discussPlotProgression.gameStateHeader')}:
{{{gameState}}}

${t('prompts.discussPlotProgression.playerQueryHeader')}:
"{{{playerQuery}}}"

${t('prompts.discussPlotProgression.instruction')}
`;

    const prompt = ai.definePrompt({
      name: 'discussPlotProgressionPrompt',
      input: {schema: DiscussPlotProgressionInputSchema},
      output: {schema: DiscussPlotProgressionOutputSchema},
      system: input.systemPrompt,
      prompt: promptText,
    });

    const {output} = await prompt(input);
    return output!;
  }
);

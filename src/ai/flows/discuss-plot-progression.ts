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
import type { DebuggableFlow } from '@/lib/types';

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
    const prompt = ai.definePrompt({
      name: 'discussPlotProgressionPrompt',
      input: {schema: DiscussPlotProgressionInputSchema},
      output: {schema: DiscussPlotProgressionOutputSchema},
      system: input.systemPrompt,
      prompt: `You are an AI Dungeon Master. The player wants to discuss the plot with you out-of-character. Your role is to be a collaborative storyteller. Do not reveal major spoilers, but guide the player, help them brainstorm, and offer suggestions or potential avenues they could explore based on the current game state.

Your response should be in: {{{language}}}.

Current Game State:
{{{gameState}}}

Player's Query:
"{{{playerQuery}}}"

Provide a helpful, in-character (as a collaborative DM) response to the player's query.`,
    });

    const {output} = await prompt(input);
    return output!;
  }
);

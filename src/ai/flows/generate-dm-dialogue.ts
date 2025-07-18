// src/ai/flows/generate-dm-dialogue.ts
'use server';

/**
 * @fileOverview AI Dungeon Master dialogue generator.
 *
 * This file defines a Genkit flow that takes player choices as input and generates
 * interactive DM dialogue and scenarios for a tabletop role-playing game experience.
 *
 * @remarks
 *  - generateDmDialogue - A function that generates the DM dialogue.
 *  - GenerateDmDialogueInput - The input type for the generateDmDialogue function.
 *  - GenerateDmDialogueOutput - The return type for the generateDmDialogue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DebuggableFlow } from '@/lib/types';

const GenerateDmDialogueInputSchema = z.object({
  playerChoice: z.string().describe('The player’s choice in the dialogue interface.'),
  gameState: z.string().describe('The current game state, including player stats, inventory, and entries.'),
  language: z.string().describe('The language for the response (e.g., "en", "zh").'),
  systemPrompt: z.string().optional().describe("An optional system prompt to override the default."),
});
export type GenerateDmDialogueInput = z.infer<typeof GenerateDmDialogueInputSchema>;

const GenerateDmDialogueOutputSchema = z.object({
  dialogue: z.string().describe('The generated dialogue from the AI Dungeon Master.'),
  scenario: z.string().describe('The generated scenario from the AI Dungeon Master.'),
});
export type GenerateDmDialogueOutput = z.infer<typeof GenerateDmDialogueOutputSchema>;

export async function generateDmDialogue(input: GenerateDmDialogueInput): Promise<GenerateDmDialogueOutput> {
  return generateDmDialogueFlow(input);
}

const generateDmDialogueFlow: DebuggableFlow<GenerateDmDialogueInput, GenerateDmDialogueOutput> = ai.defineFlow(
  {
    name: 'generateDmDialogueFlow',
    inputSchema: GenerateDmDialogueInputSchema,
    outputSchema: GenerateDmDialogueOutputSchema,
  },
  async input => {
    const generateDmDialoguePrompt = ai.definePrompt({
      name: 'generateDmDialoguePrompt',
      input: {schema: GenerateDmDialogueInputSchema},
      output: {schema: GenerateDmDialogueOutputSchema},
      system: input.systemPrompt,
      prompt: `You are an AI Dungeon Master for a tabletop role-playing game. A player has made a choice, and you must generate the next part of the story, including the DM's dialogue and a description of the scenario.

Respond in the following language: {{{language}}}.

Player's Choice: {{{playerChoice}}}

Current Game State: {{{gameState}}}

Generate the DM dialogue and scenario, continuing the story based on the player's choice and the current game state. Be creative and engaging, providing a dynamic and interactive storytelling experience.`,
    });

    const {output} = await generateDmDialoguePrompt(input);
    return output!;
  }
);

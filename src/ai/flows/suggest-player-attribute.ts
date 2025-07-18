// src/ai/flows/suggest-player-attribute.ts
'use server';
/**
 * @fileOverview Suggests a new player attribute based on the dialogue.
 *
 * - suggestPlayerAttribute - A function that suggests a new attribute.
 * - SuggestPlayerAttributeInput - The input type for the suggestPlayerAttribute function.
 * - SuggestPlayerAttributeOutput - The return type for the suggestPlayerAttribute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPlayerAttributeInputSchema = z.object({
  dialogueHistory: z.string().describe("The history of the dialogue in the game."),
  existingAttributes: z.array(z.string()).describe("The player's existing attributes."),
});
export type SuggestPlayerAttributeInput = z.infer<typeof SuggestPlayerAttributeInputSchema>;

const SuggestPlayerAttributeOutputSchema = z.object({
  name: z.string().describe('The suggested attribute name (e.g., "Charisma", "Lockpicking").'),
  reason: z.string().describe('The reason for suggesting this attribute based on the dialogue.'),
});
export type SuggestPlayerAttributeOutput = z.infer<typeof SuggestPlayerAttributeOutputSchema>;

export async function suggestPlayerAttribute(input: SuggestPlayerAttributeInput): Promise<SuggestPlayerAttributeOutput> {
  return suggestPlayerAttributeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPlayerAttributePrompt',
  input: {schema: SuggestPlayerAttributeInputSchema},
  output: {schema: SuggestPlayerAttributeOutputSchema},
  prompt: `You are an AI assistant for a tabletop role-playing game. Based on the recent dialogue history, suggest a new attribute for the player. The attribute should be relevant to the events in the dialogue.

Existing attributes: {{#each existingAttributes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. Do not suggest an existing attribute.

Dialogue History:
{{{dialogueHistory}}}

Suggest a new attribute and provide a brief reason why it would be useful for the player.`,
});

const suggestPlayerAttributeFlow = ai.defineFlow(
  {
    name: 'suggestPlayerAttributeFlow',
    inputSchema: SuggestPlayerAttributeInputSchema,
    outputSchema: SuggestPlayerAttributeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

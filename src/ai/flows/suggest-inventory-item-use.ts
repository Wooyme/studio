'use server';
/**
 * @fileOverview Suggests how the player can use items in their inventory to overcome challenges in the game.
 *
 * - suggestInventoryItemUse - A function that suggests item usage.
 * - SuggestInventoryItemUseInput - The input type for the suggestInventoryItemUse function.
 * - SuggestInventoryItemUseOutput - The return type for the suggestInventoryItemUse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInventoryItemUseInputSchema = z.object({
  inventory: z.array(z.string()).describe('The player\'s current inventory items.'),
  currentSituation: z.string().describe('The current situation the player is in.'),
});
export type SuggestInventoryItemUseInput = z.infer<typeof SuggestInventoryItemUseInputSchema>;

const SuggestInventoryItemUseOutputSchema = z.object({
  suggestedUse: z.string().describe('A suggestion for how to use an item in the inventory to overcome the current situation.'),
});
export type SuggestInventoryItemUseOutput = z.infer<typeof SuggestInventoryItemUseOutputSchema>;

export async function suggestInventoryItemUse(input: SuggestInventoryItemUseInput): Promise<SuggestInventoryItemUseOutput> {
  return suggestInventoryItemUseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInventoryItemUsePrompt',
  input: {schema: SuggestInventoryItemUseInputSchema},
  output: {schema: SuggestInventoryItemUseOutputSchema},
  prompt: `You are a Dungeon Master in a tabletop role-playing game. The player is currently in the following situation: {{{currentSituation}}}. The player has the following items in their inventory: {{#each inventory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. Suggest a creative way the player could use one or more of the items in their inventory to overcome the current situation.`,
});

const suggestInventoryItemUseFlow = ai.defineFlow(
  {
    name: 'suggestInventoryItemUseFlow',
    inputSchema: SuggestInventoryItemUseInputSchema,
    outputSchema: SuggestInventoryItemUseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

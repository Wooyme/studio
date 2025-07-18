'use server';
/**
 * @fileOverview Suggests a new player attribute based on the character setup.
 *
 * - suggestSetupAttribute - A function that suggests a new attribute for the setup page.
 * - SuggestSetupAttributeInput - The input type for the suggestSetupAttribute function.
 * - SuggestSetupAttributeOutput - The return type for the suggestSetupAttribute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSetupAttributeInputSchema = z.object({
  characterClass: z.string().describe("The character's class."),
  characterDescription: z.string().describe("The character's description."),
  existingAttributes: z.array(z.string()).describe("The player's existing attributes."),
});
export type SuggestSetupAttributeInput = z.infer<typeof SuggestSetupAttributeInputSchema>;

const SuggestSetupAttributeOutputSchema = z.object({
  name: z.string().describe('The suggested attribute name (e.g., "Stealth", "Arcana").'),
  reason: z.string().describe('The reason for suggesting this attribute based on the character setup.'),
});
export type SuggestSetupAttributeOutput = z.infer<typeof SuggestSetupAttributeOutputSchema>;

export async function suggestSetupAttribute(input: SuggestSetupAttributeInput): Promise<SuggestSetupAttributeOutput> {
  return suggestSetupAttributeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSetupAttributePrompt',
  input: {schema: SuggestSetupAttributeInputSchema},
  output: {schema: SuggestSetupAttributeOutputSchema},
  prompt: `You are an AI assistant for a tabletop role-playing game. Based on the character's class and description, suggest a new, thematic attribute for the player.

Character Class: {{{characterClass}}}
Character Description: {{{characterDescription}}}

Existing attributes: {{#each existingAttributes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. Do not suggest an existing attribute.

Suggest a new, single-word attribute and provide a brief reason why it would be a good fit for this character.`,
});

const suggestSetupAttributeFlow = ai.defineFlow(
  {
    name: 'suggestSetupAttributeFlow',
    inputSchema: SuggestSetupAttributeInputSchema,
    outputSchema: SuggestSetupAttributeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

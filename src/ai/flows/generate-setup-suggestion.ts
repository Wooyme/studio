'use server';
/**
 * @fileOverview AI assistant for character and world creation.
 *
 * This file defines a Genkit flow that helps players brainstorm and set up
 * their character and game world by providing suggestions and updating setup fields.
 *
 * - generateSetupSuggestion - A function that handles the setup suggestions.
 * - GenerateSetupSuggestionInput - The input type for the function.
 * - GenerateSetupSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { DebuggableFlow, SupportedLocale } from '@/lib/types';
import { getTranslator } from '@/lib/locales/server';

const GenerateSetupSuggestionInputSchema = z.object({
  currentSetup: z.string().describe('A JSON string representing the current character and world setup so far.'),
  playerRequest: z.string().describe('The player’s request or question to the AI assistant.'),
  language: z.string().describe('The language for the response (e.g., "en", "zh").'),
  systemPrompt: z.string().optional().describe("An optional system prompt to override the default."),
});
export type GenerateSetupSuggestionInput = z.infer<typeof GenerateSetupSuggestionInputSchema>;

const GenerateSetupSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('The AI\'s conversational response and suggestions to the player.'),
  updatedFields: z.object({
    characterName: z.string().optional(),
    characterClass: z.string().optional(),
    characterDescription: z.string().optional(),
    characterBackground: z.string().optional(),
    gameSetting: z.string().optional(),
    openingScene: z.string().optional(),
  }).optional().describe('Fields to update in the setup UI based on the suggestion. Only include fields that have changed.'),
});
export type GenerateSetupSuggestionOutput = z.infer<typeof GenerateSetupSuggestionOutputSchema>;

export async function generateSetupSuggestion(input: GenerateSetupSuggestionInput): Promise<GenerateSetupSuggestionOutput> {
  return generateSetupSuggestionFlow(input);
}

const generateSetupSuggestionFlow: DebuggableFlow<GenerateSetupSuggestionInput, GenerateSetupSuggestionOutput> = ai.defineFlow(
  {
    name: 'generateSetupSuggestionFlow',
    inputSchema: GenerateSetupSuggestionInputSchema,
    outputSchema: GenerateSetupSuggestionOutputSchema,
  },
  async input => {
    const t = await getTranslator(input.language as SupportedLocale);

    const promptText = `
${t('prompts.generateSetupSuggestion.main')}

${t('prompts.generateSetupSuggestion.responseLanguage')} {{{language}}}. ${t('prompts.generateSetupSuggestion.clarification')}

${t('prompts.generateSetupSuggestion.fieldUpdateInstruction')}

${t('prompts.generateSetupSuggestion.currentSetupHeader')}:
{{{currentSetup}}}

${t('prompts.generateSetupSuggestion.playerRequestHeader')}:
"{{{playerRequest}}}"

${t('prompts.generateSetupSuggestion.instruction')}
`;

    const prompt = ai.definePrompt({
      name: 'generateSetupSuggestionPrompt',
      input: {schema: GenerateSetupSuggestionInputSchema},
      output: {schema: GenerateSetupSuggestionOutputSchema},
      system: input.systemPrompt,
      prompt: promptText,
    });
    
    const {output} = await prompt(input);
    return output!;
  }
);

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

const GenerateSetupSuggestionInputSchema = z.object({
  currentSetup: z.string().describe('A JSON string representing the current character and world setup so far.'),
  playerRequest: z.string().describe('The player’s request or question to the AI assistant.'),
  language: z.string().describe('The language for the response (e.g., "en", "zh").'),
});
export type GenerateSetupSuggestionInput = z.infer<typeof GenerateSetupSuggestionInputSchema>;

const GenerateSetupSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('The AI\'s conversational response and suggestions to the player.'),
  updatedFields: z.object({
    characterName: z.string().optional(),
    characterDescription: z.string().optional(),
    characterBackground: z.string().optional(),
    gameSetting: z.string().optional(),
  }).optional().describe('Fields to update in the setup UI based on the suggestion. Only include fields that have changed.'),
});
export type GenerateSetupSuggestionOutput = z.infer<typeof GenerateSetupSuggestionOutputSchema>;

export async function generateSetupSuggestion(input: GenerateSetupSuggestionInput): Promise<GenerateSetupSuggestionOutput> {
  return generateSetupSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSetupSuggestionPrompt',
  input: {schema: GenerateSetupSuggestionInputSchema},
  output: {schema: GenerateSetupSuggestionOutputSchema},
  prompt: `You are an AI assistant helping a player create their character and world for a tabletop role-playing game.
The player will provide their current setup and a request. Your job is to provide creative suggestions and, if applicable, update the setup fields with new content.

Your response should be conversational and helpful, in the following language: {{{language}}}. You can ask clarifying questions or provide a few different ideas.

If the user's request directly implies a change to one of the fields (e.g., "Write a background for me", "Suggest a name for my character"), you should populate the 'updatedFields' object with the new content. Otherwise, you can leave it empty and just provide a conversational suggestion.

Current Setup:
{{{currentSetup}}}

Player's Request:
"{{{playerRequest}}}"

Now, provide your suggestion and any field updates.`,
});

const generateSetupSuggestionFlow = ai.defineFlow(
  {
    name: 'generateSetupSuggestionFlow',
    inputSchema: GenerateSetupSuggestionInputSchema,
    outputSchema: GenerateSetupSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

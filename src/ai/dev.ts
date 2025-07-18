import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-session-recap.ts';
import '@/ai/flows/suggest-inventory-item-use.ts';
import '@/ai/flows/generate-dm-dialogue.ts';
import '@/ai/flows/suggest-player-attribute.ts';
import '@/ai/flows/generate-setup-suggestion.ts';
import '@/ai/flows/suggest-setup-attribute.ts';
import '@/ai/flows/discuss-plot-progression.ts';

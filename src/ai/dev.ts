import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-session-recap.ts';
import '@/ai/flows/suggest-inventory-item-use.ts';
import '@/ai/flows/generate-dm-dialogue.ts';
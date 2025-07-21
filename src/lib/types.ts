export interface PlayerAttribute {
  id: string;
  name: string;
  value: number;
  icon: string;
}

export interface BodyPart {
  id: string;
  name: string;
  icon: string;
  category: 'Head' | 'Torso' | 'Legs' | 'Feet' | 'Hand' | 'Underwear' | 'Overtop';
  equippedItem: InventoryItem | null;
}

export interface PlayerStats {
  name: string;
  class: string;
  level: number;
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  attributes: PlayerAttribute[];
  bodyParts: BodyPart[];
}

export interface InventoryItem {
  id: string;
  name: string;
  bodyPart?: BodyPart['category']; // Where the item can be equipped
}

export interface JournalEntry {
  id: string;
  content: string;
}

export interface DialogueMessage {
  id: string;
  speaker: 'DM' | 'Player';
  text: string;
  choices?: string[];
}

export type SupportedLocale = 'en' | 'zh';

export type DebuggableFlow<I, O> = (input: I) => Promise<O>;

export interface Action {
  id: string;
  name: string;
  icon: string;
  requiresBodyPart: boolean;
  requiresTarget: boolean;
}

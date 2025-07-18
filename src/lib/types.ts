export interface PlayerStats {
  name: string;
  class: string;
  level: number;
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  attributes: {
    name: string;
    value: number;
    icon: string;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
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

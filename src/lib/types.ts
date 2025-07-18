export interface PlayerStats {
  name: string;
  class: string;
  level: number;
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
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

"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { PlayerStats, InventoryItem, JournalEntry, DialogueMessage } from '@/lib/types';
import { nanoid } from 'nanoid';

interface GameContextType {
  stats: PlayerStats;
  setStats: Dispatch<SetStateAction<PlayerStats>>;
  inventory: InventoryItem[];
  setInventory: Dispatch<SetStateAction<InventoryItem[]>>;
  addInventoryItem: (name: string) => void;
  journal: JournalEntry[];
  setJournal: Dispatch<SetStateAction<JournalEntry[]>>;
  addJournalEntry: (content: string) => void;
  dialogue: DialogueMessage[];
  setDialogue: Dispatch<SetStateAction<DialogueMessage[]>>;
  addDialogueMessage: (message: Omit<DialogueMessage, 'id'>) => void;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialStats: PlayerStats = {
  name: 'Aethelred',
  class: 'Rogue',
  level: 1,
  hp: { current: 10, max: 10 },
  ac: 14,
  attributes: [
    { name: 'STR', value: 10, icon: 'Swords' },
    { name: 'DEX', value: 16, icon: 'Dices' },
    { name: 'CON', value: 12, icon: 'Heart' },
    { name: 'INT', value: 13, icon: 'Brain' },
    { name: 'WIS', value: 11, icon: 'BookOpen' },
    { name: 'CHA', value: 14, icon: 'Smile' },
  ],
};

const initialDialogue: DialogueMessage[] = [
  {
    id: nanoid(),
    speaker: 'DM',
    text: "You awaken in a dimly lit tavern, the smell of stale ale and sawdust filling your nostrils. Your head throbs, a dull reminder of last night's revelry. Across the room, a cloaked figure in a shadowy corner seems to be watching you. A half-empty mug of ale sits on the table before you.",
  }
]

export function GameProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PlayerStats>(initialStats);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [dialogue, setDialogue] = useState<DialogueMessage[]>(initialDialogue);
  const [isLoading, setIsLoading] = useState(false);

  const addInventoryItem = (name: string) => {
    setInventory(prev => [...prev, { id: nanoid(), name }]);
  };

  const addJournalEntry = (content: string) => {
    setJournal(prev => [...prev, { id: nanoid(), content }]);
  };

  const addDialogueMessage = (message: Omit<DialogueMessage, 'id'>) => {
    setDialogue(prev => [...prev, { ...message, id: nanoid() }]);
  }

  const value = {
    stats,
    setStats,
    inventory,
    setInventory,
    addInventoryItem,
    journal,
    setJournal,
    addJournalEntry,
    dialogue,
    setDialogue,
    addDialogueMessage,
    isLoading,
    setIsLoading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

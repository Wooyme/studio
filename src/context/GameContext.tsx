// src/context/GameContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useMemo } from 'react';
import type { PlayerStats, InventoryItem, JournalEntry, DialogueMessage, PlayerAttribute } from '@/lib/types';
import { nanoid } from 'nanoid';
import { useLocalization } from './LocalizationContext';

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
  addAttribute: (attribute: Omit<PlayerAttribute, 'id'>) => void;
  updateAttribute: (id: string, newAttribute: PlayerAttribute) => void;
  deleteAttribute: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialStats: PlayerStats = {
  name: 'Aethelred',
  class: 'Rogue',
  level: 1,
  hp: { current: 10, max: 10 },
  ac: 14,
  attributes: [
    { id: nanoid(), name: 'STR', value: 10, icon: 'Swords' },
    { id: nanoid(), name: 'DEX', value: 16, icon: 'Dices' },
    { id: nanoid(), name: 'CON', value: 12, icon: 'Heart' },
    { id: nanoid(), name: 'INT', value: 13, icon: 'Brain' },
    { id: nanoid(), name: 'WIS', value: 11, icon: 'BookOpen' },
    { id: nanoid(), name: 'CHA', value: 14, icon: 'Smile' },
  ],
};

export function GameProvider({ children }: { children: ReactNode }) {
  const { t, locale } = useLocalization();
  
  const initialDialogue: DialogueMessage[] = useMemo(() => [
    {
      id: nanoid(),
      speaker: 'DM',
      text: t('initialDialogue'),
    }
  ], [t]);

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

  const addAttribute = (attribute: Omit<PlayerAttribute, 'id'>) => {
    const newAttribute = { ...attribute, id: nanoid() };
    setStats(prevStats => ({
      ...prevStats,
      attributes: [...prevStats.attributes, newAttribute]
    }));
  };

  const updateAttribute = (id: string, newAttribute: PlayerAttribute) => {
    setStats(prevStats => ({
      ...prevStats,
      attributes: prevStats.attributes.map(attr => attr.id === id ? newAttribute : attr)
    }));
  };

  const deleteAttribute = (id: string) => {
    setStats(prevStats => ({
      ...prevStats,
      attributes: prevStats.attributes.filter(attr => attr.id !== id)
    }));
  };

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
    addAttribute,
    updateAttribute,
    deleteAttribute,
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

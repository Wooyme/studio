// src/context/GameContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  gameReady: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialStats: PlayerStats = {
  name: '',
  class: '',
  level: 0,
  hp: { current: 0, max: 0 },
  ac: 0,
  attributes: [],
};

export function GameProvider({ children }: { children: ReactNode }) {
  const { t } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  
  const [stats, setStats] = useState<PlayerStats>(initialStats);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    const hasInitialSetup = stats.name && stats.attributes.length > 0 && dialogue.length > 0;
    if (hasInitialSetup && !gameReady) {
      setGameReady(true);
    }
  }, [stats, dialogue, gameReady]);

  useEffect(() => {
    if (!gameReady && pathname !== '/setup') {
        router.replace('/setup');
    }
  }, [gameReady, pathname, router]);

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
    gameReady,
  };

  if (!gameReady && pathname !== '/setup') {
    // Render a loading state or nothing, but the context provider needs to be there for setup page
    return (
        <GameContext.Provider value={value}>
            {pathname === '/setup' ? children : null}
        </GameContext.Provider>
    );
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

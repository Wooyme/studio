// src/context/GameContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { PlayerStats, InventoryItem, JournalEntry, DialogueMessage, PlayerAttribute, Action, BodyPart } from '@/lib/types';
import { nanoid } from 'nanoid';
import { useLocalization } from './LocalizationContext';
import { generateDmDialogue } from '@/ai/flows/generate-dm-dialogue';
import { toast } from '@/hooks/use-toast';

interface GameContextType {
  stats: PlayerStats;
  setStats: Dispatch<SetStateAction<PlayerStats>>;
  inventory: InventoryItem[];
  setInventory: Dispatch<SetStateAction<InventoryItem[]>>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, name: string, bodyPart?: BodyPart['category']) => void;
  deleteInventoryItem: (id: string) => void;
  journal: JournalEntry[];
  setJournal: Dispatch<SetStateAction<JournalEntry[]>>;
  addJournalEntry: (content: string) => void;
  updateJournalEntry: (id: string, content: string) => void;
  deleteJournalEntry: (id: string) => void;
  dialogue: DialogueMessage[];
  setDialogue: Dispatch<SetStateAction<DialogueMessage[]>>;
  addDialogueMessage: (message: Omit<DialogueMessage, 'id'>) => void;
  updateDialogueMessage: (id: string, text: string) => void;
  deleteDialogueMessage: (id: string) => void;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  addAttribute: (attribute: Omit<PlayerAttribute, 'id'>) => void;
  updateAttribute: (id: string, newAttribute: PlayerAttribute) => void;
  deleteAttribute: (id: string) => void;
  gameReady: boolean;
  debugSystemPrompt: string;
  setDebugSystemPrompt: Dispatch<SetStateAction<string>>;
  
  // Action system state
  currentAction: Action | null;
  setCurrentAction: Dispatch<SetStateAction<Action | null>>;
  currentBodyPart: BodyPart | null;
  setCurrentBodyPart: Dispatch<SetStateAction<BodyPart | null>>;
  currentTarget: string | null;
  setCurrentTarget: Dispatch<SetStateAction<string | null>>;
  isActionReady: () => boolean;
  submitPlayerAction: () => void;
  equipItem: (item: InventoryItem) => void;
  unequipItem: (bodyPartId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_DEBUG_PROMPT = 'tabletopai_debug_prompt';

const initialStats: PlayerStats = {
  name: '',
  class: '',
  level: 0,
  hp: { current: 0, max: 0 },
  ac: 0,
  attributes: [],
  bodyParts: [],
};

export function GameProvider({ children }: { children: ReactNode }) {
  const { t, locale } = useLocalization();
  const router = useRouter();
  const pathname = usePathname();
  
  const [stats, setStats] = useState<PlayerStats>(initialStats);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameReady, setGameReady] = useState(false);
  const [debugSystemPrompt, setDebugSystemPrompt] = useState('');

  // State for the action system
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [currentBodyPart, setCurrentBodyPart] = useState<BodyPart | null>(null);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);


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

  useEffect(() => {
    const savedPrompt = localStorage.getItem(LOCAL_STORAGE_KEY_DEBUG_PROMPT);
    if (savedPrompt) {
      setDebugSystemPrompt(savedPrompt);
    }
  }, []);

  useEffect(() => {
    if (debugSystemPrompt) {
      localStorage.setItem(LOCAL_STORAGE_KEY_DEBUG_PROMPT, debugSystemPrompt);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_DEBUG_PROMPT);
    }
  }, [debugSystemPrompt]);
  
  useEffect(() => {
      setCurrentBodyPart(null);
      setCurrentTarget(null);
  }, [currentAction]);


  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => [...prev, { ...item, id: nanoid() }]);
  };

  const updateInventoryItem = (id: string, name: string, bodyPart?: BodyPart['category']) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, name, bodyPart } : item));
  };

  const deleteInventoryItem = (id: string) => {
    const itemToUneqip = stats.bodyParts.find(p => p.equippedItem?.id === id);
    if(itemToUneqip) {
      unequipItem(itemToUneqip.id);
    }
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const addJournalEntry = (content: string) => {
    setJournal(prev => [...prev, { id: nanoid(), content }]);
  };

  const updateJournalEntry = (id: string, content: string) => {
    setJournal(prev => prev.map(entry => entry.id === id ? { ...entry, content } : entry));
  };

  const deleteJournalEntry = (id: string) => {
    setJournal(prev => prev.filter(entry => entry.id !== id));
  };

  const addDialogueMessage = (message: Omit<DialogueMessage, 'id'>) => {
    setDialogue(prev => [...prev, { ...message, id: nanoid() }]);
  }

  const updateDialogueMessage = (id: string, text: string) => {
    setDialogue(prev => prev.map(msg => msg.id === id ? { ...msg, text } : msg));
  };

  const deleteDialogueMessage = (id: string) => {
    setDialogue(prev => prev.filter(msg => msg.id !== id));
  };

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
  
  const isActionReady = useCallback(() => {
    if (!currentAction) return false;
    if (currentAction.requiresBodyPart && !currentBodyPart) return false;
    if (currentAction.requiresTarget && !currentTarget) return false;
    return true;
  }, [currentAction, currentBodyPart, currentTarget]);
  
  const getPlayerActionText = useCallback(() => {
    if (!isActionReady()) return "";
    let text = `${t(currentAction!.name as any)}`;
    if (currentAction!.requiresBodyPart) {
      text += ` ${t('action.with')} ${t(currentBodyPart!.name as any)}`;
    }
    if (currentAction!.requiresTarget) {
      text += ` ${currentTarget}`;
    }
    return text;
  }, [isActionReady, currentAction, currentBodyPart, currentTarget, t]);

  const submitPlayerAction = useCallback(async () => {
    if (!isActionReady()) return;
    
    const actionText = getPlayerActionText();
    addDialogueMessage({ speaker: 'Player', text: actionText });
    setIsLoading(true);
    
    setCurrentAction(null);
    setCurrentBodyPart(null);
    setCurrentTarget(null);

    const translatedStats = {
      ...stats,
      class: t('stats.class'),
    };
    const gameState = JSON.stringify({ stats: translatedStats, inventory, journal });

    try {
      const result = await generateDmDialogue({ 
        playerChoice: actionText, 
        gameState, 
        language: locale,
        systemPrompt: debugSystemPrompt || undefined,
      });
      
      const combinedText = `${result.dialogue}\n\n${result.scenario}`;
      
      addDialogueMessage({
        speaker: 'DM',
        text: combinedText,
      });

    } catch (error) {
      console.error('Error generating DM dialogue:', error);
      addDialogueMessage({
        speaker: 'DM',
        text: t('connectionError'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [isActionReady, getPlayerActionText, stats, inventory, journal, locale, debugSystemPrompt, t, addDialogueMessage]);

  const equipItem = (item: InventoryItem) => {
    if (!item.bodyPart) {
      toast({ title: t('toast.cannotEquip.title'), description: t('toast.cannotEquip.description')});
      return;
    };

    const targetBodyPart = stats.bodyParts.find(
      (part) => part.category === item.bodyPart && !part.equippedItem
    );

    if (targetBodyPart) {
      // Unequip item if it's already equipped somewhere else
      unequipItem(item.id, true);

      setStats((prevStats) => ({
        ...prevStats,
        bodyParts: prevStats.bodyParts.map((part) =>
          part.id === targetBodyPart.id ? { ...part, equippedItem: item } : part
        ),
      }));
      setInventory(prev => prev.filter(i => i.id !== item.id));
      toast({ title: t('toast.itemEquipped.title'), description: t('toast.itemEquipped.description', { item: item.name, bodyPart: t(targetBodyPart.name as any) }) });
    } else {
      toast({ title: t('toast.noSlot.title'), description: t('toast.noSlot.description', { category: item.bodyPart }) });
    }
  };

  const unequipItem = (bodyPartId: string, silent = false) => {
    const targetBodyPart = stats.bodyParts.find((part) => part.id === bodyPartId || part.equippedItem?.id === bodyPartId);
    if (targetBodyPart && targetBodyPart.equippedItem) {
      const itemToUnequip = targetBodyPart.equippedItem;
      setStats((prevStats) => ({
        ...prevStats,
        bodyParts: prevStats.bodyParts.map((part) =>
          part.id === targetBodyPart.id ? { ...part, equippedItem: null } : part
        ),
      }));
      addInventoryItem(itemToUnequip);
      if (!silent) {
        toast({ title: t('toast.itemUnequipped.title'), description: t('toast.itemUnequipped.description', { item: itemToUnequip.name }) });
      }
    }
  };


  const value = {
    stats,
    setStats,
    inventory,
    setInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    journal,
    setJournal,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    dialogue,
    setDialogue,
    addDialogueMessage,
    updateDialogueMessage,
    deleteDialogueMessage,
    isLoading,
    setIsLoading,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    gameReady,
    debugSystemPrompt,
    setDebugSystemPrompt,
    // Action system
    currentAction,
    setCurrentAction,
    currentBodyPart,
    setCurrentBodyPart,
    currentTarget,
    setCurrentTarget,
    isActionReady,
    submitPlayerAction,
    equipItem,
    unequipItem,
  };

  if (!gameReady && pathname !== '/setup') {
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

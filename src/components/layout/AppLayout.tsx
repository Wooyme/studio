"use client";

import DialogueInterface from '@/components/dialogue/DialogueInterface';
import InventoryAndJournalPanel from '@/components/panels/InventoryAndJournalPanel';
import StatsPanel from '@/components/panels/StatsPanel';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout() {
  const { gameReady } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!gameReady) {
      router.replace('/setup');
    }
  }, [gameReady, router]);

  if (!gameReady) {
    return null; // Or a loading screen
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_320px] h-screen bg-background text-foreground font-body overflow-hidden">
      <StatsPanel />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <DialogueInterface />
      </main>
      <InventoryAndJournalPanel />
    </div>
  );
}

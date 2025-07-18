// src/components/layout/AppLayout.tsx
"use client";

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, Swords, ScrollText } from 'lucide-react';
import StatsPanel from '@/components/panels/StatsPanel';
import DialogueInterface from '@/components/dialogue/DialogueInterface';
import InventoryAndJournalPanel from '@/components/panels/InventoryAndJournalPanel';
import AppHeader from './AppHeader';

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
    <div className="h-screen bg-background text-foreground font-body overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden">
        <AppHeader />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_320px] h-screen md:h-auto">
        {/* Desktop Left Panel */}
        <div className="hidden md:flex">
          <StatsPanel />
        </div>
        
        <main className="flex-1 flex flex-col overflow-hidden h-full md:h-screen">
          <DialogueInterface />
        </main>
        
        {/* Desktop Right Panel */}
        <div className="hidden md:flex">
          <InventoryAndJournalPanel />
        </div>
      </div>
    </div>
  );
}

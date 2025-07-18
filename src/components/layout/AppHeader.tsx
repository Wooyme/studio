// src/components/layout/AppHeader.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PanelLeft, Swords, ScrollText } from 'lucide-react';
import StatsPanel from '../panels/StatsPanel';
import InventoryAndJournalPanel from '../panels/InventoryAndJournalPanel';
import { useLocalization } from '@/context/LocalizationContext';

export default function AppHeader() {
  const { t } = useLocalization();

  return (
    <header className="flex items-center justify-between p-2 border-b bg-card">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <PanelLeft className="mr-2 h-4 w-4" />
            {t('mobile.characterSheet')}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-sm p-0 border-r-0 flex flex-col">
          <SheetHeader>
            <SheetTitle className="sr-only">{t('mobile.characterSheet')}</SheetTitle>
          </SheetHeader>
          <StatsPanel />
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Swords className="mr-2 h-4 w-4" />
            {t('mobile.inventoryAndJournal')}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-sm p-0 border-l-0 flex flex-col">
           <SheetHeader>
            <SheetTitle className="sr-only">{t('mobile.inventoryAndJournal')}</SheetTitle>
          </SheetHeader>
          <InventoryAndJournalPanel />
        </SheetContent>
      </Sheet>
    </header>
  );
}

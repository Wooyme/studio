"use client";

import { useState, useRef, useCallback, ReactNode, CSSProperties } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { useLocalization } from '@/context/LocalizationContext';
import { toast } from '@/hooks/use-toast';
import { BookPlus, ScrollText } from 'lucide-react';

export default function TextSelectionPopover({ children }: { children: ReactNode }) {
  const { addInventoryItem, addJournalEntry } = useGame();
  const { t } = useLocalization();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const selectedTextRef = useRef('');

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';

    if (text && selection) {
      const range = selection.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        selectedTextRef.current = text;
        setOpen(true);
      }
    } else {
      setOpen(false);
    }
  }, []);

  const handleAddToInventory = () => {
    addInventoryItem(selectedTextRef.current);
    toast({ title: t('toast.itemAdded.title'), description: t('toast.itemAdded.description', { item: selectedTextRef.current }) });
    setOpen(false);
  };

  const handleAddToJournal = () => {
    addJournalEntry(selectedTextRef.current);
    toast({ title: t('toast.entryAdded.title'), description: t('toast.entryAdded.description') });
    setOpen(false);
  };
  
  return (
    <div onMouseUp={handleMouseUp} className="flex-1 overflow-hidden relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <div
            className="absolute"
            style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px`, height: `${position.height}px`, pointerEvents: 'none' }}
            />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1" style={{ position: 'absolute', top: `${position.top - 50}px`, left: `${position.left + position.width / 2}px`, transform: 'translateX(-50%)' }}>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleAddToInventory}>
              <BookPlus className="h-4 w-4 mr-2" />
              {t('buttons.addToInventory')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleAddToJournal}>
              <ScrollText className="h-4 w-4 mr-2" />
              {t('buttons.addToJournal')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {children}
    </div>
  );
}

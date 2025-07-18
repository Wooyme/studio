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
  const [position, setPosition] = useState<DOMRect | undefined>(undefined);
  const selectedTextRef = useRef('');
  const popoverTriggerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? '';

        if (text && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range) {
            const rect = range.getBoundingClientRect();
            // Check if the selection is not empty and has a size
            if (rect.width > 0 || rect.height > 0) {
                setPosition(rect);
                selectedTextRef.current = text;
                setOpen(true);
            } else {
                setOpen(false);
            }
        }
        } else {
        setOpen(false);
        }
    }, 0);
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
  
  const getTriggerStyle = (): CSSProperties => {
    if (!position || !popoverTriggerRef.current) return { display: 'none' };
    
    const parentRect = popoverTriggerRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return { display: 'none' };

    return {
        position: 'absolute',
        top: `${position.top - parentRect.top}px`,
        left: `${position.left - parentRect.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        pointerEvents: 'none',
    }
  }

  return (
    <div onMouseUp={handleMouseUp} className="flex-1 overflow-hidden relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <div
                ref={popoverTriggerRef}
                style={getTriggerStyle()}
            />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1" side="top" align="center">
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

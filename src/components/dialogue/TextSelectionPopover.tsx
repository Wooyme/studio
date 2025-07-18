"use client";

import { useState, useRef, useCallback, ReactNode, CSSProperties } from 'react';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { toast } from '@/hooks/use-toast';
import { BookPlus, ScrollText } from 'lucide-react';

export default function TextSelectionPopover({ children }: { children: ReactNode }) {
  const { addInventoryItem, addJournalEntry } = useGame();
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
    toast({ title: "Item Added", description: `"${selectedTextRef.current}" was added to your inventory.` });
    setOpen(false);
  };

  const handleAddToJournal = () => {
    addJournalEntry(selectedTextRef.current);
    toast({ title: "Entry Added", description: `A new entry was added to your journal.` });
    setOpen(false);
  };

  const popoverStyle: CSSProperties = {
      position: 'absolute',
      top: `${position.top - 50}px`,
      left: `${position.left + position.width / 2}px`,
      transform: 'translateX(-50%)',
  };


  return (
    <div onMouseUp={handleMouseUp} className="flex-1 overflow-hidden relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor style={popoverStyle} />
        <PopoverContent className="w-auto p-1">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleAddToInventory}>
              <BookPlus className="h-4 w-4 mr-2" />
              Add to Inventory
            </Button>
            <Button variant="ghost" size="sm" onClick={handleAddToJournal}>
              <ScrollText className="h-4 w-4 mr-2" />
              Add to Journal
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {children}
    </div>
  );
}

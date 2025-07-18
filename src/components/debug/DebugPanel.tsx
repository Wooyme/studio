// src/components/debug/DebugPanel.tsx
"use client";

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Bug } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

export default function DebugPanel() {
  const { debugSystemPrompt, setDebugSystemPrompt } = useGame();
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(debugSystemPrompt);

  if (process.env.NEXT_PUBLIC_DEBUG_MODE !== 'true') {
    return null;
  }
  
  const handleSave = () => {
    setDebugSystemPrompt(localPrompt);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg">
          <Bug className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('debug.title')}</DialogTitle>
          <DialogDescription>{t('debug.description')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder={t('debug.placeholder')}
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={10}
            className="font-code text-xs"
          />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => {
                setLocalPrompt('');
                setDebugSystemPrompt('');
            }}>{t('debug.clear')}</Button>
          <Button onClick={handleSave}>{t('buttons.saveChanges')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

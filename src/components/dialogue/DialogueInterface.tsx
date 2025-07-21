// src/components/dialogue/DialogueInterface.tsx
"use client";

import { useGame } from '@/context/GameContext';
import { useLocalization } from '@/context/LocalizationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import TextSelectionPopover from './TextSelectionPopover';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { summarizeSessionRecap } from '@/ai/flows/summarize-session-recap';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import type { DialogueMessage } from '@/lib/types';
import ActionToolbar from './ActionToolbar';

export default function DialogueInterface() {
  const { 
    dialogue, 
    isLoading,
    debugSystemPrompt,
    updateDialogueMessage,
    deleteDialogueMessage
  } = useGame();
  const { t, locale } = useLocalization();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [recap, setRecap] = useState<string | null>(null);
  const [isRecapping, setIsRecapping] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMessage, setEditingMessage] = useState<DialogueMessage | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [dialogue]);
  
  const handleRecap = async () => {
      setIsRecapping(true);
      setRecap(null);
      const sessionLog = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');
      try {
        const result = await summarizeSessionRecap({ 
          sessionLog,
          language: locale,
          systemPrompt: debugSystemPrompt || undefined,
        });
        setRecap(result.summary);
      } catch (error) {
        console.error("Failed to get recap:", error);
        setRecap(t('recapError'));
      }
      setIsRecapping(false);
  }

  const openEditDialog = (message: DialogueMessage) => {
    setEditingMessage(message);
    setEditText(message.text);
  };

  const handleEditSubmit = () => {
    if (editingMessage) {
      updateDialogueMessage(editingMessage.id, editText);
      setEditingMessage(null);
      setEditText("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background md:border-x">
       <div className="p-4 border-b hidden md:flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold">{t('adventureTitle')}</h2>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
              <Label htmlFor="edit-mode">{t('editMode.label')}</Label>
            </div>
            <Button onClick={handleRecap} variant="outline" size="sm" disabled={isRecapping}>
                {isRecapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('buttons.getRecap')}
            </Button>
        </div>
       </div>
       {recap && (
            <Card className="m-4 border-b text-sm">
                <CardHeader className='p-4'>
                    <CardTitle className='text-base'>{t('sessionRecapTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-muted-foreground">
                    <p>{recap}</p>
                </CardContent>
            </Card>
        )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TextSelectionPopover>
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-6 p-4">
                {dialogue.map(msg => (
                  <div key={msg.id} className={`flex flex-col group ${msg.speaker === 'Player' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-xl relative ${msg.speaker === 'DM' ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                       {isEditMode && (
                          <div className="absolute top-0 -right-2 transform -translate-y-1/2 flex items-center gap-1 bg-background p-1 rounded-md border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(msg)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteDialogueMessage(msg.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start">
                      <div className="rounded-lg px-4 py-2 max-w-xl bg-card flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('dmThinking')}</span>
                      </div>
                  </div>
                )}
              </div>
            </ScrollArea>
        </TextSelectionPopover>
      </div>
      <ActionToolbar />
      <Dialog open={!!editingMessage} onOpenChange={(isOpen) => !isOpen && setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editMode.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('editMode.dialogDescription')}</DialogDescription>
          </DialogHeader>
          <Textarea 
            value={editText} 
            onChange={(e) => setEditText(e.target.value)}
            rows={6}
            className="my-4"
          />
          <DialogFooter>
            <Button onClick={handleEditSubmit}>{t('buttons.saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

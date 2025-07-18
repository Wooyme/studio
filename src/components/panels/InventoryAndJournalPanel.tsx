// src/components/panels/InventoryAndJournalPanel.tsx
"use client";

import { useGame } from '@/context/GameContext';
import { useLocalization } from '@/context/LocalizationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookMarked, ScrollText, Swords, Sparkles, Loader2, Send, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { suggestInventoryItemUse } from '@/ai/flows/suggest-inventory-item-use';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { discussPlotProgression } from '@/ai/flows/discuss-plot-progression';
import { cn } from '@/lib/utils';
import type { InventoryItem, JournalEntry } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface DiscussionMessage {
    speaker: 'Player' | 'AI';
    text: string;
}

export default function InventoryAndJournalPanel({ className }: { className?: string }) {
  const { 
    inventory, 
    journal, 
    dialogue, 
    stats,
    updateInventoryItem,
    deleteInventoryItem,
    updateJournalEntry,
    deleteJournalEntry,
    debugSystemPrompt,
   } = useGame();
  const { t, locale } = useLocalization();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [discussionHistory, setDiscussionHistory] = useState<DiscussionMessage[]>([]);
  const [discussionInput, setDiscussionInput] = useState('');
  const [isDiscussing, setIsDiscussing] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | JournalEntry | null>(null);
  const [editText, setEditText] = useState('');

  const handleSuggestion = async () => {
    setIsSuggesting(true);
    setSuggestion(null);
    const lastMessage = dialogue.findLast(m => m.speaker === 'DM');
    if (lastMessage) {
        try {
            const res = await suggestInventoryItemUse({
                inventory: inventory.map(i => i.name),
                currentSituation: lastMessage.text,
                systemPrompt: debugSystemPrompt || undefined,
            });
            setSuggestion(res.suggestedUse);
        } catch (error) {
            console.error("Failed to get suggestion:", error);
            setSuggestion(t('suggestionError'));
        }
    }
    setIsSuggesting(false);
  }

  const handleDiscussionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionInput.trim()) return;

    const newPlayerMessage: DiscussionMessage = { speaker: 'Player', text: discussionInput };
    setDiscussionHistory(prev => [...prev, newPlayerMessage]);
    setIsDiscussing(true);
    setDiscussionInput('');

    const gameState = JSON.stringify({ stats, inventory, journal, dialogue });

    try {
      const result = await discussPlotProgression({
        playerQuery: discussionInput,
        gameState,
        language: locale,
        systemPrompt: debugSystemPrompt || undefined,
      });
      const newAiMessage: DiscussionMessage = { speaker: 'AI', text: result.dmResponse };
      setDiscussionHistory(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error with plot discussion:", error);
      const errorMessage: DiscussionMessage = { speaker: 'AI', text: t('connectionError') };
      setDiscussionHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsDiscussing(false);
    }
  }

  const openEditModal = (item: InventoryItem | JournalEntry) => {
    setEditingItem(item);
    if ('name' in item) {
      setEditText(item.name);
    } else {
      setEditText(item.content);
    }
    setIsEditModalOpen(true);
  }

  const handleEditSubmit = () => {
    if (!editingItem || !editText.trim()) return;

    if ('name' in editingItem) {
      updateInventoryItem(editingItem.id, editText);
    } else {
      updateJournalEntry(editingItem.id, editText);
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
    setEditText('');
  }

  return (
    <aside className={cn("bg-card flex-col h-full border-l", className)}>
      <Tabs defaultValue="inventory" className="flex flex-col h-full">
        <div className="p-2 border-b">
          <TabsList className="grid w-full grid-cols-2 bg-background">
            <TabsTrigger value="inventory">
              <Swords className="w-4 h-4 mr-2" />
              {t('tabs.inventory')}
            </TabsTrigger>
            <TabsTrigger value="journal">
              <ScrollText className="w-4 h-4 mr-2" />
              {t('tabs.journal')}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inventory" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full p-4">
            {inventory.length > 0 ? (
              <ul className="space-y-2">
                {inventory.map(item => (
                  <li key={item.id} className="text-sm p-2 bg-background rounded-md flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-primary" />
                      <span>{item.name}</span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditModal(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteInventoryItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-8">{t('inventoryEmpty')}</p>
            )}
             <div className="mt-4">
                <Button onClick={handleSuggestion} disabled={isSuggesting || inventory.length === 0} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2"/>
                    {isSuggesting ? t('buttons.thinking') : t('buttons.getSuggestion')}
                </Button>
                {suggestion && (
                    <Card className="mt-4 bg-background">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">{t('suggestion.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                            {suggestion}
                        </CardContent>
                    </Card>
                )}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="journal" className="flex-1 overflow-hidden m-0 flex flex-col">
            <ScrollArea className="h-full p-4">
              {journal.length > 0 ? (
                <ul className="space-y-3">
                  {journal.map(entry => (
                    <li key={entry.id} className="text-sm p-3 bg-background rounded-md border group relative">
                      <p>{entry.content}</p>
                       <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1 bg-background/80 rounded-md p-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditModal(entry)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteJournalEntry(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-8">{t('journalEmpty')}</p>
              )}
            </ScrollArea>
            <Separator className="my-2" />
            <div className="p-4 pt-0 flex flex-col flex-1">
                <h3 className="text-sm font-medium mb-2">{t('discussPlot.title')}</h3>
                <Card className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 h-32 p-3">
                        <div className="space-y-3 text-sm">
                            {discussionHistory.map((msg, index) => (
                                <div key={index} className={`flex ${msg.speaker === 'Player' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-2 rounded-lg max-w-xs ${msg.speaker === 'Player' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isDiscussing && (
                                <div className="flex justify-start">
                                    <div className="p-2 rounded-lg bg-muted flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                        <span className="text-xs text-muted-foreground">{t('dmThinking')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-2 border-t">
                        <form onSubmit={handleDiscussionSubmit} className="flex gap-2">
                            <Input
                                placeholder={t('discussPlot.inputPlaceholder')}
                                value={discussionInput}
                                onChange={e => setDiscussionInput(e.target.value)}
                                disabled={isDiscussing}
                                className="h-9"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9" disabled={isDiscussing || !discussionInput.trim()}>
                                <Send />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem && 'name' in editingItem ? t('editModal.editItemTitle') : t('editModal.editEntryTitle')}</DialogTitle>
            <DialogDescription>{t('editModal.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editingItem && 'name' in editingItem ? (
                <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
            ) : (
                <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={5} />
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit}>{t('buttons.saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

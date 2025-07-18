"use client";

import { useGame } from '@/context/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookMarked, ScrollText, Swords, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { suggestInventoryItemUse } from '@/ai/flows/suggest-inventory-item-use';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';

export default function InventoryAndJournalPanel() {
  const { inventory, journal, dialogue } = useGame();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestion = async () => {
    setIsSuggesting(true);
    setSuggestion(null);
    const lastMessage = dialogue.findLast(m => m.speaker === 'DM');
    if (lastMessage) {
        try {
            const res = await suggestInventoryItemUse({
                inventory: inventory.map(i => i.name),
                currentSituation: lastMessage.text
            });
            setSuggestion(res.suggestedUse);
        } catch (error) {
            console.error("Failed to get suggestion:", error);
            setSuggestion("Could not get a suggestion at this time.");
        }
    }
    setIsSuggesting(false);
  }

  return (
    <aside className="bg-card hidden md:flex flex-col h-screen border-l">
      <Tabs defaultValue="inventory" className="flex flex-col h-full">
        <div className="p-2">
          <TabsList className="grid w-full grid-cols-2 bg-background">
            <TabsTrigger value="inventory">
              <Swords className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="journal">
              <ScrollText className="w-4 h-4 mr-2" />
              Journal
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inventory" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4">
            {inventory.length > 0 ? (
              <ul className="space-y-2">
                {inventory.map(item => (
                  <li key={item.id} className="text-sm p-2 bg-background rounded-md flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-primary" />
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-8">Your inventory is empty.</p>
            )}
             <div className="mt-4">
                <Button onClick={handleSuggestion} disabled={isSuggesting || inventory.length === 0} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2"/>
                    {isSuggesting ? 'Thinking...' : 'Get Suggestion'}
                </Button>
                {suggestion && (
                    <Card className="mt-4 bg-background">
                        <CardContent className="p-4 text-sm text-foreground">
                            {suggestion}
                        </CardContent>
                    </Card>
                )}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="journal" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full px-4">
            {journal.length > 0 ? (
              <ul className="space-y-3">
                {journal.map(entry => (
                  <li key={entry.id} className="text-sm p-3 bg-background rounded-md border">
                    {entry.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-8">Your journal is empty.</p>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

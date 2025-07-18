"use client";

import { useGame } from '@/context/GameContext';
import { useLocalization } from '@/context/LocalizationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { generateDmDialogue } from '@/ai/flows/generate-dm-dialogue';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState, FormEvent } from 'react';
import TextSelectionPopover from './TextSelectionPopover';
import { Loader2, Send } from 'lucide-react';
import { summarizeSessionRecap } from '@/ai/flows/summarize-session-recap';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function DialogueInterface() {
  const { dialogue, addDialogueMessage, stats, inventory, journal, isLoading, setIsLoading } = useGame();
  const { t, locale, translations } = useLocalization();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [recap, setRecap] = useState<string | null>(null);
  const [isRecapping, setIsRecapping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [dialogue]);

  const handlePlayerInput = async (input: string) => {
    if (!input.trim()) return;

    addDialogueMessage({ speaker: 'Player', text: input });
    setIsLoading(true);
    setInputValue('');

    const translatedStats = {
      ...stats,
      class: t('stats.class'),
    };
    const gameState = JSON.stringify({ stats: translatedStats, inventory, journal });

    try {
      const result = await generateDmDialogue({ playerChoice: input, gameState, language: locale });
      
      const combinedText = `${result.dialogue}\n\n${result.scenario}`;
      
      addDialogueMessage({
        speaker: 'DM',
        text: combinedText,
      });

    } catch (error) {
      console.error('Error generating DM dialogue:', error);
      addDialogueMessage({
        speaker: 'DM',
        text: t('connectionError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handlePlayerInput(inputValue);
  };
  
  const handleRecap = async () => {
      setIsRecapping(true);
      setRecap(null);
      const sessionLog = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');
      try {
        const result = await summarizeSessionRecap({ sessionLog });
        setRecap(result.summary);
      } catch (error) {
        console.error("Failed to get recap:", error);
        setRecap(t('recapError'));
      }
      setIsRecapping(false);
  }

  return (
    <div className="flex flex-col h-full bg-background md:border-x">
       <div className="p-4 border-b hidden md:flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold">{t('adventureTitle')}</h2>
        <Button onClick={handleRecap} variant="outline" size="sm" disabled={isRecapping}>
            {isRecapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('buttons.getRecap')}
        </Button>
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
      <TextSelectionPopover>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {dialogue.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.speaker === 'Player' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-xl ${msg.speaker === 'DM' ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}

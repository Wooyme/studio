"use client";

import { useGame } from '@/context/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { generateDmDialogue } from '@/ai/flows/generate-dm-dialogue';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import TextSelectionPopover from './TextSelectionPopover';
import { Loader2 } from 'lucide-react';
import { summarizeSessionRecap } from '@/ai/flows/summarize-session-recap';

export default function DialogueInterface() {
  const { dialogue, addDialogueMessage, stats, inventory, journal, isLoading, setIsLoading } = useGame();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [recap, setRecap] = useState<string | null>(null);
  const [isRecapping, setIsRecapping] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [dialogue]);

  const handleChoice = async (choice: string) => {
    addDialogueMessage({ speaker: 'Player', text: choice });
    setIsLoading(true);

    const gameState = JSON.stringify({ stats, inventory, journal });

    try {
      const result = await generateDmDialogue({ playerChoice: choice, gameState });
      
      const combinedText = `${result.dialogue}\n\n${result.scenario}`;
      
      addDialogueMessage({
        speaker: 'DM',
        text: combinedText,
        // These choices are static as the AI doesn't generate them.
        choices: ["What do I see?", "Check my belongings.", "Say nothing.", "Continue forward."],
      });

    } catch (error) {
      console.error('Error generating DM dialogue:', error);
      addDialogueMessage({
        speaker: 'DM',
        text: 'The connection flickers. Please try again.',
        choices: dialogue.findLast(m => m.speaker === 'DM')?.choices,
      });
    } finally {
      setIsLoading(false);
    }
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
        setRecap("Could not generate a recap at this time.");
      }
      setIsRecapping(false);
  }

  const lastMessage = dialogue[dialogue.length - 1];

  return (
    <div className="flex flex-col h-full bg-background border-x">
       <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold">The Adventure</h2>
        <Button onClick={handleRecap} variant="outline" size="sm" disabled={isRecapping}>
            {isRecapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get Recap
        </Button>
       </div>
       {recap && (
            <div className="p-4 bg-card border-b text-sm">
                <h3 className="font-bold mb-2">Session Recap:</h3>
                <p className="text-muted-foreground">{recap}</p>
            </div>
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
                    <span className="text-sm text-muted-foreground">The DM is thinking...</span>
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </TextSelectionPopover>
      <div className="p-4 border-t bg-card">
        {lastMessage && lastMessage.speaker === 'DM' && !isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {lastMessage.choices?.map(choice => (
              <Button key={nanoid()} variant="outline" onClick={() => handleChoice(choice)} className="justify-start text-left h-auto">
                {choice}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

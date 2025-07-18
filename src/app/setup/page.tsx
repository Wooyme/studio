"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/context/GameContext';
import { generateSetupSuggestion } from '@/ai/flows/generate-setup-suggestion';
import { Loader2, Send, Wand2 } from 'lucide-react';
import Image from 'next/image';
import type { PlayerAttribute } from '@/lib/types';

interface SetupState {
  characterName: string;
  characterDescription: string;
  characterBackground: string;
  gameSetting: string;
  characterImage: string;
  attributes: PlayerAttribute[];
}

interface ChatMessage {
    speaker: 'Player' | 'AI';
    text: string;
}

export default function SetupPage() {
  const router = useRouter();
  const { setStats, addAttribute } = useGame();
  
  const [setupState, setSetupState] = useState<SetupState>({
    characterName: 'Aethelred',
    characterDescription: 'A cunning rogue with a quick wit and even quicker fingers.',
    characterBackground: 'Grew up an orphan on the streets, learned to survive by their wits alone.',
    gameSetting: 'A classic medieval fantasy world with sprawling kingdoms, dark forests, and ancient ruins.',
    characterImage: 'https://placehold.co/512x512.png',
    attributes: [
      { id: '1', name: 'STR', value: 10, icon: 'Swords' },
      { id: '2', name: 'DEX', value: 16, icon: 'Dices' },
      { id: '3', name: 'CON', value: 12, icon: 'Heart' },
      { id: '4', name: 'INT', value: 13, icon: 'Brain' },
      { id: '5', name: 'WIS', value: 11, icon: 'BookOpen' },
      { id: '6', name: 'CHA', value: 14, icon: 'Smile' },
    ],
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof SetupState, value: string) => {
    setSetupState(prev => ({ ...prev, [field]: value }));
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newPlayerMessage: ChatMessage = { speaker: 'Player', text: userInput };
    setChatHistory(prev => [...prev, newPlayerMessage]);
    setIsLoading(true);
    setUserInput('');

    try {
      const result = await generateSetupSuggestion({
        currentSetup: JSON.stringify(setupState),
        playerRequest: userInput,
      });

      const newAiMessage: ChatMessage = { speaker: 'AI', text: result.suggestion };
      setChatHistory(prev => [...prev, newAiMessage]);

      if (result.updatedFields) {
        setSetupState(prev => ({...prev, ...result.updatedFields}));
      }

    } catch (error) {
      console.error("Error with AI suggestion:", error);
      const errorMessage: ChatMessage = { speaker: 'AI', text: "Sorry, I couldn't process that. Please try again." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = () => {
    setStats(prev => ({
        ...prev,
        name: setupState.characterName,
        attributes: setupState.attributes,
    }));
    // TODO: A way to pass more context like background and setting to the game.
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-body">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
            <h1 className="text-4xl font-headline font-bold text-primary mb-2">Create Your Adventure</h1>
            <p className="text-muted-foreground">Design your character and world. Use the AI assistant on the right to help you brainstorm ideas!</p>
        </div>
        
        {/* Left Panel: Setup Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Character & World Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="space-y-1 w-full md:w-1/3">
                    <Label htmlFor="characterImage">Character Image</Label>
                    <Image src={setupState.characterImage} alt="Character Portrait" width={512} height={512} className="rounded-lg border aspect-square object-cover" data-ai-hint="fantasy character portrait" />
                </div>
                <div className="space-y-4 w-full md:w-2/3">
                    <div className="space-y-1">
                      <Label htmlFor="characterName">Character Name</Label>
                      <Input id="characterName" value={setupState.characterName} onChange={(e) => handleInputChange('characterName', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="characterDescription">Character Description</Label>
                      <Textarea id="characterDescription" value={setupState.characterDescription} onChange={(e) => handleInputChange('characterDescription', e.target.value)} rows={3}/>
                    </div>
                </div>
             </div>

            <div className="space-y-1">
              <Label htmlFor="characterBackground">Character Background</Label>
              <Textarea id="characterBackground" value={setupState.characterBackground} onChange={(e) => handleInputChange('characterBackground', e.target.value)} rows={5}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="gameSetting">Game Setting</Label>
              <Textarea id="gameSetting" value={setupState.gameSetting} onChange={(e) => handleInputChange('gameSetting', e.target.value)} rows={5}/>
            </div>

             <div className="lg:col-span-2 mt-6 flex justify-end">
                <Button onClick={startGame} size="lg">Start Game</Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: AI Chat */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wand2/> AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 h-96 p-4 border rounded-md">
                <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.speaker === 'Player' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-sm ${msg.speaker === 'Player' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input 
                placeholder="e.g., 'Suggest a darker background for my rogue'" 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !userInput.trim()}>
                <Send />
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

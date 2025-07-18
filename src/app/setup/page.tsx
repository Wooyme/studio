// src/app/setup/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/context/GameContext';
import { generateSetupSuggestion } from '@/ai/flows/generate-setup-suggestion';
import { Loader2, Send, Wand2, Languages, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { PlayerAttribute } from '@/lib/types';
import { useLocalization } from '@/context/LocalizationContext';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { suggestSetupAttribute } from '@/ai/flows/suggest-setup-attribute';
import { toast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

interface SetupState {
  characterName: string;
  characterDescription: string;
  characterClass: string;
  characterBackground: string;
  gameSetting: string;
  openingScene: string;
  characterImage: string;
  attributes: PlayerAttribute[];
}

interface ChatMessage {
    speaker: 'Player' | 'AI';
    text: string;
}

const getIcon = (name: string): React.FC<LucideProps> => {
    const Icon = (LucideIcons as any)[name];
    if (Icon) {
      return Icon;
    }
    return LucideIcons.HelpCircle; 
};

const attributeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  value: z.coerce.number().min(0, { message: "Value must be a positive number." }),
  icon: z.string().min(2, { message: "Icon name must be at least 2 characters." }),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

export default function SetupPage() {
  const router = useRouter();
  const { setStats, setDialogue } = useGame();
  const { t, locale, setLocale } = useLocalization();

  const [setupState, setSetupState] = useState<SetupState>({
    characterName: '',
    characterDescription: '',
    characterClass: '',
    characterBackground: '',
    gameSetting: '',
    openingScene: '',
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<PlayerAttribute | null>(null);
  const [isSuggestingAttr, setIsSuggestingAttr] = useState(false);
  const [attrSuggestion, setAttrSuggestion] = useState<{name: string, reason: string} | null>(null);
  
  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: { name: "", value: 10, icon: "HelpCircle" },
  });

  useEffect(() => {
    setSetupState(prev => ({
        ...prev,
        characterName: t('setup.defaults.characterName'),
        characterDescription: t('setup.defaults.characterDescription'),
        characterClass: t('setup.defaults.characterClass'),
        characterBackground: t('setup.defaults.characterBackground'),
        gameSetting: t('setup.defaults.gameSetting'),
        openingScene: t('setup.defaults.openingScene'),
    }));
    setChatHistory([ { speaker: 'AI', text: t('setup.ai.initialMessage') } ]);
  }, [t]);

  const toggleLocale = () => setLocale(locale === 'en' ? 'zh' : 'en');
  const handleInputChange = (field: keyof Omit<SetupState, 'attributes' | 'characterImage'>, value: string) => setSetupState(prev => ({ ...prev, [field]: value }));
  const handleOpenDialog = (attribute: PlayerAttribute | null = null) => {
    setEditingAttribute(attribute);
    setAttrSuggestion(null);
    if (attribute) {
      form.reset({ name: attribute.name, value: attribute.value, icon: attribute.icon });
    } else {
      form.reset({ name: "", value: 10, icon: "HelpCircle" });
    }
    setIsDialogOpen(true);
  };
  
  const handleFormSubmit = (data: AttributeFormData) => {
    if (editingAttribute) {
      setSetupState(prev => ({ ...prev, attributes: prev.attributes.map(attr => attr.id === editingAttribute.id ? { ...attr, ...data } : attr) }));
    } else {
      setSetupState(prev => ({ ...prev, attributes: [...prev.attributes, { ...data, id: nanoid() }] }));
    }
    setIsDialogOpen(false);
  };

  const deleteAttribute = (id: string) => {
    setSetupState(prev => ({ ...prev, attributes: prev.attributes.filter(attr => attr.id !== id) }));
  }
  
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
        language: locale,
      });
      const newAiMessage: ChatMessage = { speaker: 'AI', text: result.suggestion };
      setChatHistory(prev => [...prev, newAiMessage]);
      if (result.updatedFields) {
        setSetupState(prev => ({...prev, ...result.updatedFields}));
      }
    } catch (error) {
      console.error("Error with AI suggestion:", error);
      const errorMessage: ChatMessage = { speaker: 'AI', text: t('setup.ai.errorMessage') };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAttrSuggestion = async () => {
    setIsSuggestingAttr(true);
    setAttrSuggestion(null);
    try {
      const res = await suggestSetupAttribute({
        characterClass: setupState.characterClass,
        characterDescription: setupState.characterDescription,
        existingAttributes: setupState.attributes.map(a => a.name)
      });
      setAttrSuggestion(res);
      toast({ title: t('toast.suggestionReady.title'), description: t('toast.suggestionReady.description') });
    } catch (error) {
      console.error("Failed to get attribute suggestion:", error);
      toast({ title: t('toast.suggestionError.title'), description: t('toast.suggestionError.description'), variant: 'destructive'});
    } finally {
      setIsSuggestingAttr(false);
    }
  }

  const startGame = () => {
    setStats({
        name: setupState.characterName,
        attributes: setupState.attributes,
        class: setupState.characterClass,
        level: 1,
        hp: { current: 20, max: 20 },
        ac: 10,
    });
    setDialogue([{ speaker: 'DM', text: setupState.openingScene, id: 'initial' }]);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-body">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-headline font-bold text-primary mb-2">{t('setup.title')}</h1>
                <p className="text-muted-foreground">{t('setup.description')}</p>
              </div>
               <Button variant="ghost" size="icon" onClick={toggleLocale} title="Switch Language">
                <Languages className="h-6 w-6" />
              </Button>
            </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('setup.form.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="space-y-1 w-full md:w-1/3">
                    <Label htmlFor="characterImage">{t('setup.form.characterImageLabel')}</Label>
                    <Image src={setupState.characterImage} alt="Character Portrait" width={512} height={512} className="rounded-lg border aspect-square object-cover" data-ai-hint="fantasy character portrait" />
                </div>
                <div className="space-y-4 w-full md:w-2/3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="characterName">{t('setup.form.characterNameLabel')}</Label>
                        <Input id="characterName" value={setupState.characterName} onChange={(e) => handleInputChange('characterName', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="characterClass">{t('setup.form.characterClassLabel')}</Label>
                        <Input id="characterClass" value={setupState.characterClass} onChange={(e) => handleInputChange('characterClass', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="characterDescription">{t('setup.form.characterDescriptionLabel')}</Label>
                      <Textarea id="characterDescription" value={setupState.characterDescription} onChange={(e) => handleInputChange('characterDescription', e.target.value)} rows={3}/>
                    </div>
                </div>
             </div>
            
            <div className="space-y-2">
                <Label>{t('setup.form.attributesLabel')}</Label>
                <Card className="p-4 bg-muted/50">
                    <div className="space-y-3">
                        {setupState.attributes.map(attr => {
                            const Icon = getIcon(attr.icon);
                            return (
                                <div key={attr.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Icon className="h-4 w-4 text-primary" />
                                        <span>{attr.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            value={attr.value} 
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 0;
                                                setSetupState(prev => ({...prev, attributes: prev.attributes.map(a => a.id === attr.id ? {...a, value} : a)}))
                                            }}
                                            className="w-20 h-8"
                                        />
                                        <div className="hidden group-hover:flex items-center gap-1">
                                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog(attr)}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteAttribute(attr.id)}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4" onClick={() => handleOpenDialog()}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('buttons.addAttribute')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingAttribute ? t('attributeModal.editTitle') : t('attributeModal.addTitle')}</DialogTitle>
                          <DialogDescription>{t('attributeModal.description')}</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>{t('attributeModal.nameLabel')}</FormLabel> <FormControl><Input placeholder="e.g. Strength" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="value" render={({ field }) => ( <FormItem> <FormLabel>{t('attributeModal.valueLabel')}</FormLabel> <FormControl><Input type="number" placeholder="10" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="icon" render={({ field }) => ( <FormItem> <FormLabel>{t('attributeModal.iconLabel')}</FormLabel> <FormControl><Input placeholder="e.g. Swords" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <DialogFooter>
                              <Button type="submit">{editingAttribute ? t('buttons.saveChanges') : t('buttons.addAttribute')}</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <div className="mt-2">
                      <Button onClick={handleAttrSuggestion} disabled={isSuggestingAttr} className="w-full" variant="ghost">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isSuggestingAttr ? t('buttons.thinking') : t('buttons.getAttrSuggestion')}
                      </Button>
                      {attrSuggestion && (
                        <Card className="mt-2 bg-background text-sm">
                           <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center justify-between">
                                <span>{t('suggestion.title')}: {attrSuggestion.name}</span>
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{attrSuggestion.reason}</p>
                            <Button className="w-full" size="sm" onClick={() => {
                                setSetupState(prev => ({ ...prev, attributes: [...prev.attributes, { id: nanoid(), name: attrSuggestion.name, value: 10, icon: 'HelpCircle' }] }));
                                setAttrSuggestion(null);
                                toast({ title: t('toast.attributeAdded.title'), description: t('toast.attributeAdded.description', { attribute: attrSuggestion.name }) });
                            }}>
                                <Plus className="w-4 h-4 mr-2"/>
                                {t('buttons.addThisAttribute')}
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                </Card>
            </div>

            <div className="space-y-1">
              <Label htmlFor="characterBackground">{t('setup.form.characterBackgroundLabel')}</Label>
              <Textarea id="characterBackground" value={setupState.characterBackground} onChange={(e) => handleInputChange('characterBackground', e.target.value)} rows={5}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="gameSetting">{t('setup.form.gameSettingLabel')}</Label>
              <Textarea id="gameSetting" value={setupState.gameSetting} onChange={(e) => handleInputChange('gameSetting', e.target.value)} rows={5}/>
            </div>
            <div className="space-y-1">
                <Label htmlFor="openingScene">{t('setup.form.openingSceneLabel')}</Label>
                <Textarea id="openingScene" value={setupState.openingScene} onChange={(e) => handleInputChange('openingScene', e.target.value)} rows={5}/>
            </div>

             <div className="lg:col-span-2 mt-6 flex justify-end">
                <Button onClick={startGame} size="lg">{t('setup.buttons.startGame')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wand2/> {t('setup.ai.title')}</CardTitle>
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
                                <span className="text-sm text-muted-foreground">{t('dmThinking')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input 
                placeholder={t('setup.ai.inputPlaceholder')} 
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

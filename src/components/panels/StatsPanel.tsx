"use client";

import { useGame } from '@/context/GameContext';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { Button } from '../ui/button';
import { Languages, Plus, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { PlayerAttribute } from '@/lib/types';
import { suggestPlayerAttribute } from '@/ai/flows/suggest-player-attribute';
import { toast } from '@/hooks/use-toast';

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center justify-between text-sm w-full">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

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

export default function StatsPanel() {
  const { stats, dialogue, updateAttribute, addAttribute, deleteAttribute } = useGame();
  const { t, setLocale, locale } = useLocalization();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<PlayerAttribute | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<{name: string, reason: string} | null>(null);

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: "",
      value: 10,
      icon: "HelpCircle",
    },
  });

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  };

  const handleOpenDialog = (attribute: PlayerAttribute | null = null) => {
    setEditingAttribute(attribute);
    if (attribute) {
      form.reset({ name: attribute.name, value: attribute.value, icon: attribute.icon });
    } else {
      form.reset({ name: "", value: 10, icon: "HelpCircle" });
    }
    setIsDialogOpen(true);
  };
  
  const handleFormSubmit = (data: AttributeFormData) => {
    if (editingAttribute) {
      updateAttribute(editingAttribute.id, { ...editingAttribute, ...data });
    } else {
      addAttribute(data);
    }
    setIsDialogOpen(false);
  };

  const handleSuggestion = async () => {
    setIsSuggesting(true);
    setSuggestion(null);
    const dialogueHistory = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');
    try {
      const res = await suggestPlayerAttribute({
        dialogueHistory,
        existingAttributes: stats.attributes.map(a => a.name)
      });
      setSuggestion(res);
      toast({ title: t('toast.suggestionReady.title'), description: t('toast.suggestionReady.description') });
    } catch (error) {
      console.error("Failed to get attribute suggestion:", error);
      toast({ title: t('toast.suggestionError.title'), description: t('toast.suggestionError.description'), variant: 'destructive'});
    } finally {
      setIsSuggesting(false);
    }
  }

  const UserIcon = getIcon('User');
  const StarIcon = getIcon('Star');
  const HeartIcon = getIcon('Heart');
  const ShieldIcon = getIcon('Shield');

  return (
    <aside className="bg-card hidden md:flex flex-col h-screen border-r">
       <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-headline font-bold text-primary">TabletopAI</h1>
        <Button variant="ghost" size="icon" onClick={toggleLocale} title="Switch Language">
          <Languages className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="p-2">
            <CardTitle className="flex items-center gap-3 text-lg font-headline">
              <UserIcon className="w-6 h-6 text-primary" />
              {stats.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-4">
            <StatItem icon={StarIcon} label={t('stats.class')} value={`${stats.class} (Lvl ${stats.level})`} />
            <StatItem icon={HeartIcon} label={t('stats.health')} value={`${stats.hp.current} / ${stats.hp.max}`} />
            <StatItem icon={ShieldIcon} label={t('stats.ac')} value={stats.ac} />
            <Separator />
            <div className="space-y-1">
              {stats.attributes.map((attr) => {
                const AttrIcon = getIcon(attr.icon);
                return (
                  <div key={attr.id} className="flex items-center justify-between group">
                    <StatItem
                      icon={AttrIcon}
                      label={attr.name}
                      value={attr.value}
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
                  <DialogDescription>
                    {t('attributeModal.description')}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('attributeModal.nameLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Strength" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('attributeModal.valueLabel')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('attributeModal.iconLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Swords" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">{editingAttribute ? t('buttons.saveChanges') : t('buttons.addAttribute')}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <div className="mt-4">
              <Button onClick={handleSuggestion} disabled={isSuggesting} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                {isSuggesting ? t('buttons.thinking') : t('buttons.getAttrSuggestion')}
              </Button>
              {suggestion && (
                <Card className="mt-4 bg-background text-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{t('suggestion.title')}: {suggestion.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{suggestion.reason}</p>
                    <Button className="w-full" size="sm" onClick={() => {
                        addAttribute({name: suggestion.name, value: 10, icon: 'HelpCircle'});
                        setSuggestion(null);
                        toast({ title: t('toast.attributeAdded.title'), description: t('toast.attributeAdded.description', { attribute: suggestion.name }) });
                    }}>
                        <Plus className="w-4 h-4 mr-2"/>
                        {t('buttons.addThisAttribute')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground">
            {t('textSelectionHint')}
          </p>
        </div>
    </aside>
  );
}

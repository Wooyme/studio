"use client";

import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Heart, Star, Swords, Dices, Brain, BookOpen, Smile } from 'lucide-react';

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

export default function StatsPanel() {
  const { stats } = useGame();

  return (
    <aside className="bg-card hidden md:flex flex-col h-screen border-r">
      <div className="p-4">
        <h1 className="text-2xl font-headline font-bold text-primary">TabletopAI</h1>
      </div>
      <Separator />
      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="p-2">
            <CardTitle className="flex items-center gap-3 text-lg font-headline">
              <User className="w-6 h-6 text-primary" />
              {stats.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-4">
            <StatItem icon={Star} label="Class" value={`${stats.class} (Lvl ${stats.level})`} />
            <StatItem icon={Heart} label="Health" value={`${stats.hp.current} / ${stats.hp.max}`} />
            <StatItem icon={Shield} label="Armor Class" value={stats.ac} />
            <Separator />
            <div className="grid grid-cols-2 gap-4">
                <StatItem icon={Swords} label="STR" value={stats.strength} />
                <StatItem icon={Dices} label="DEX" value={stats.dexterity} />
                <StatItem icon={Heart} label="CON" value={stats.constitution} />
                <StatItem icon={Brain} label="INT" value={stats.intelligence} />
                <StatItem icon={BookOpen} label="WIS" value={stats.wisdom} />
                <StatItem icon={Smile} label="CHA" value={stats.charisma} />
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground">
            Select text in the dialogue to add items to your inventory or notes to your journal.
          </p>
        </div>
    </aside>
  );
}

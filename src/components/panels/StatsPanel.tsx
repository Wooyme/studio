"use client";

import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

// A helper to safely get a Lucide icon by name
const getIcon = (name: string): React.FC<LucideProps> => {
  const Icon = (LucideIcons as any)[name];
  if (Icon) {
    return Icon;
  }
  return LucideIcons.HelpCircle; // Fallback icon
};

export default function StatsPanel() {
  const { stats } = useGame();

  const UserIcon = getIcon('User');
  const StarIcon = getIcon('Star');
  const HeartIcon = getIcon('Heart');
  const ShieldIcon = getIcon('Shield');


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
              <UserIcon className="w-6 h-6 text-primary" />
              {stats.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-4">
            <StatItem icon={StarIcon} label="Class" value={`${stats.class} (Lvl ${stats.level})`} />
            <StatItem icon={HeartIcon} label="Health" value={`${stats.hp.current} / ${stats.hp.max}`} />
            <StatItem icon={ShieldIcon} label="Armor Class" value={stats.ac} />
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {stats.attributes.map((attr) => {
                const AttrIcon = getIcon(attr.icon);
                return (
                  <StatItem
                    key={attr.name}
                    icon={AttrIcon}
                    label={attr.name}
                    value={attr.value}
                  />
                )
              })}
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
